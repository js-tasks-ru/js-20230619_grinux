
export const defaultToDate = () => new Date();
export const defaultFromDate = to => {
  let date = new Date(to);
  date.setMonth(date.getMonth() - 1);
  return date;
}
