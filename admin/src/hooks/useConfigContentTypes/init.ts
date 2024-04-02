const init = (initialState: any, shouldFetchData: boolean) => ({
  ...initialState,
  isLoading: shouldFetchData,
});

export default init;
