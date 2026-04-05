import { format } from 'date-fns';

const NotificationsFeed = ({ notifications = [] }) => {
    return (
        <div className="card glass">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Notifications</h3>
                <button className="text-xs text-primary-400 hover:text-primary-300">Mark all read</button>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {notifications.length === 0 ? (
                    <p className="text-dark-400 text-center py-4">No new notifications.</p>
                ) : (
                    notifications.map((notif) => (
                        <div key={notif._id} className="flex gap-3 p-3 rounded-lg hover:bg-dark-800/50 transition-colors cursor-pointer group">
                            <div className="mt-1">
                                <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                            </div>
                            <div>
                                <h5 className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">
                                    {notif.title}
                                </h5>
                                <p className="text-xs text-dark-400 line-clamp-2">{notif.message}</p>
                                <span className="text-[10px] text-dark-500 mt-1 block">
                                    {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsFeed;
