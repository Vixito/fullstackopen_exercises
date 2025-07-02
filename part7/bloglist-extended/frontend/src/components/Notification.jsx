import { useSelector } from 'react-redux';

const Notification = () => {
  const notification = useSelector((state) => state.notification);
  if (!notification.message) return null;

  const style = {
    color: notification.type === 'success' ? 'green' : 'red',
    background: '#f4f4f4',
    fontSize: 20,
    border: `2px solid ${notification.type === 'success' ? 'green' : 'red'}`,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlign: 'center',
  };
  return <div style={style}>{notification.message}</div>;
};

export default Notification;
