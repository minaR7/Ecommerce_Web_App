import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(advancedFormat);
dayjs.extend(utc);

export const formatAdminDate = (input) => {
  if (!input) return '';
  const d = dayjs.utc(input);
  if (!d.isValid()) return String(input);
  return d.format('Do MMMM YYYY HH:mm:ss');
};
