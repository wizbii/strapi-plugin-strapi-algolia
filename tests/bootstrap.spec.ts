import bootstrap from '../server/src/bootstrap';

describe('bootstrap', () => {
  let strapi: any;
  let registerMany: jest.Mock;
  let loadLifecycleMethods: jest.Mock;
  let logError: jest.Mock;

  beforeEach(() => {
    registerMany = jest.fn();
    loadLifecycleMethods = jest.fn();
    logError = jest.fn();

    strapi = {
      admin: {
        services: {
          permission: { actionProvider: { registerMany } },
        },
      },
      plugin: jest.fn().mockReturnValue({
        service: jest.fn().mockReturnValue({ loadLifecycleMethods }),
      }),
      log: { error: logError },
    } as any;
  });

  test('registers permissions and loads lifecycles successfully', async () => {
    await bootstrap({ strapi });

    expect(registerMany).toHaveBeenCalledTimes(1);
    expect(loadLifecycleMethods).toHaveBeenCalledTimes(1);
    expect(logError).not.toHaveBeenCalled();
  });

  test('logs error and continues when permission registration fails', async () => {
    registerMany.mockRejectedValue(new Error('Permission error'));

    await bootstrap({ strapi });

    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining('permissions bootstrap failed')
    );
    expect(loadLifecycleMethods).toHaveBeenCalledTimes(1);
  });

  test('logs error when lifecycle loading fails', async () => {
    loadLifecycleMethods.mockRejectedValue(
      new Error('Lifecycle error')
    );

    await bootstrap({ strapi });

    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining('lifecycles failed')
    );
  });

  test('logs both errors independently when both registration and lifecycle loading fail', async () => {
    registerMany.mockRejectedValue(new Error('Permission error'));
    loadLifecycleMethods.mockRejectedValue(
      new Error('Lifecycle error')
    );

    await bootstrap({ strapi });

    expect(logError).toHaveBeenCalledTimes(2);
  });
});
