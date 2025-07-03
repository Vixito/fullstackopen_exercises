import { useNotificationValue } from '../contexts/NotificationContext';

const Notification = () => {
  const notification = useNotificationValue();

  if (!notification.message) return null;

  const notificationClass = `notification ${notification.type}`;

  return <div className={notificationClass}>{notification.message}</div>;
};

export default Notification;
