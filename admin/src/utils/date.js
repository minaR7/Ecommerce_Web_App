import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

export const formatAdminDate = (input) => {
  if (!input) return '';
  const d = dayjs(input);
  if (!d.isValid()) return String(input);
  return d.format('Do MMMM YYYY HH:mm:ss');
};
