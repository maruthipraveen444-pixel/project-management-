import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// @desc    Punch In/Out with attendance record
// @route   POST /api/attendance/punch
// @access  Private
export const punchInOut = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already punched in today
        let todayRecord = await Attendance.findOne({ user: userId, date: today });

        if (!user.currentStatus.isPunchedIn) {
            // PUNCH IN
            if (todayRecord && todayRecord.status === 'Completed') {
                return res.status(400).json({
                    success: false,
                    message: 'You have already completed your attendance for today'
                });
            }

            const punchInTime = new Date();

            // Create attendance record if doesn't exist
            if (!todayRecord) {
                todayRecord = await Attendance.create({
                    user: userId,
                    date: today,
                    punchInTime
                });
            }

            // Update user status
            user.currentStatus.isPunchedIn = true;
            user.currentStatus.punchInTime = punchInTime;
            user.currentStatus.workedHoursToday = 0;
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Punched in successfully',
                data: {
                    isPunchedIn: true,
                    punchInTime,
                    attendanceId: todayRecord._id
                }
            });
        } else {
            // PUNCH OUT
            if (!todayRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'No punch-in record found for today'
                });
            }

            const punchOutTime = new Date();

            // Update attendance record
            todayRecord.punchOutTime = punchOutTime;
            await todayRecord.save(); // This triggers pre-save hook to calculate hours

            // Update user status
            user.currentStatus.isPunchedIn = false;
            user.currentStatus.punchOutTime = punchOutTime;
            user.currentStatus.workedHoursToday = todayRecord.totalHours;
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Punched out successfully',
                data: {
                    isPunchedIn: false,
                    punchOutTime,
                    totalHours: todayRecord.totalHours.toFixed(2),
                    overtime: todayRecord.overtime.toFixed(2)
                }
            });
        }
    } catch (error) {
        console.error('Punch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get attendance records with filters
// @route   GET /api/attendance
// @access  Private
export const getAttendanceRecords = async (req, res) => {
    try {
        const { startDate, endDate, userId, department, page = 1, limit = 20 } = req.query;
        const currentUser = req.user;

        // Build query
        let query = {};

        // Role-based filtering
        const canViewAll = ['Super Admin', 'Project Admin', 'Project Manager'].includes(currentUser.role);

        if (!canViewAll) {
            // Regular users can only see their own records
            query.user = currentUser._id;
        } else if (userId) {
            // Admin filtering by specific user
            query.user = userId;
        }

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Department filter (requires user population and filtering)
        let departmentFilter = department && canViewAll ? department : null;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        let attendanceQuery = Attendance.find(query)
            .populate('user', 'name email department designation photo')
            .sort({ date: -1, punchInTime: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        let records = await attendanceQuery;

        // Filter by department if specified
        if (departmentFilter) {
            records = records.filter(r => r.user?.department === departmentFilter);
        }

        // Get total count
        const total = await Attendance.countDocuments(query);

        // Calculate totals
        const allRecords = await Attendance.find(query);
        const totalHours = allRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
        const totalOvertime = allRecords.reduce((sum, r) => sum + (r.overtime || 0), 0);

        res.status(200).json({
            success: true,
            data: records,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            totals: {
                totalHours: totalHours.toFixed(2),
                totalOvertime: totalOvertime.toFixed(2)
            },
            canViewAll
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Private
export const getTodayAttendance = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const record = await Attendance.findOne({
            user: req.user._id,
            date: today
        });

        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Export attendance to CSV
// @route   GET /api/attendance/export
// @access  Private (Admin/Manager only)
export const exportAttendance = async (req, res) => {
    try {
        const currentUser = req.user;
        const canExport = ['Super Admin', 'Project Admin', 'Project Manager'].includes(currentUser.role);

        if (!canExport) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to export data'
            });
        }

        const { startDate, endDate, userId, department, format = 'csv' } = req.query;

        // Build query
        let query = {};
        if (userId) query.user = userId;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        let records = await Attendance.find(query)
            .populate('user', 'name email department designation')
            .sort({ date: -1 });

        // Filter by department if specified
        if (department) {
            records = records.filter(r => r.user?.department === department);
        }

        // Calculate totals
        const totalHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
        const totalOvertime = records.reduce((sum, r) => sum + (r.overtime || 0), 0);

        // Format time helper
        const formatTime = (date) => {
            if (!date) return '';
            return new Date(date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        const formatDate = (date) => {
            if (!date) return '';
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        };

        if (format === 'csv') {
            // Generate CSV
            const headers = ['Name', 'Email', 'Department', 'Date', 'Punch In', 'Punch Out', 'Break (hrs)', 'Total Hours', 'Overtime'];
            const rows = records.map(r => [
                r.user?.name || '',
                r.user?.email || '',
                r.user?.department || '',
                formatDate(r.date),
                formatTime(r.punchInTime),
                formatTime(r.punchOutTime),
                (r.breakTime / 60).toFixed(2),
                r.totalHours?.toFixed(2) || '0.00',
                r.overtime?.toFixed(2) || '0.00'
            ]);

            // Add totals row
            rows.push(['', '', '', 'TOTAL', '', '', '', totalHours.toFixed(2), totalOvertime.toFixed(2)]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
            return res.send(csvContent);
        }

        // Return JSON for Excel generation on frontend
        res.status(200).json({
            success: true,
            data: records.map(r => ({
                name: r.user?.name || '',
                email: r.user?.email || '',
                department: r.user?.department || '',
                date: formatDate(r.date),
                punchIn: formatTime(r.punchInTime),
                punchOut: formatTime(r.punchOutTime),
                breakHours: (r.breakTime / 60).toFixed(2),
                totalHours: r.totalHours?.toFixed(2) || '0.00',
                overtime: r.overtime?.toFixed(2) || '0.00'
            })),
            totals: {
                totalHours: totalHours.toFixed(2),
                totalOvertime: totalOvertime.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update break time for today
// @route   PUT /api/attendance/break
// @access  Private
export const updateBreakTime = async (req, res) => {
    try {
        const { breakTime } = req.body; // in minutes
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const record = await Attendance.findOne({
            user: req.user._id,
            date: today
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'No attendance record found for today'
            });
        }

        record.breakTime = breakTime;
        await record.save();

        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
