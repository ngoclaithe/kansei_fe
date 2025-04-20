import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import workShiftApi from '../services/apiWorkShift';
import apiBooking from '../services/apiBooking';
import apiConstruction from '../services/apiConstruction';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, setMonth, setYear } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast } from 'react-toastify';

const GuestBookingPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [workShifts, setWorkShifts] = useState([]);
    const [constructions, setConstructions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [selectedConstruction, setSelectedConstruction] = useState('');

    // Fetch initial data
    useEffect(() => {
        Promise.all([
            fetchWorkShifts(),
            fetchConstructions()
        ]).then(() => setLoading(false));
    }, []);

    // Fetch work shifts
    const fetchWorkShifts = async () => {
        try {
            const response = await workShiftApi.getWorkShiftsTrue();
            setWorkShifts(response.data);
        } catch (error) {
            console.error('Error fetching work shifts:', error);
            toast.error('シフトデータの読み込みに失敗しました');
        }
    };

    // Fetch constructions
    const fetchConstructions = async () => {
        try {
            const response = await apiConstruction.getConstructions();
            setConstructions(response.data);
        } catch (error) {
            console.error('Error fetching constructions:', error);
            toast.error('工事データの読み込みに失敗しました');
        }
    };

    // Handle booking creation
    const handleCreateBooking = async (e) => {
        e.preventDefault();
        if (!selectedConstruction) {
            toast.error('工事を選択してください');
            return;
        }

        try {
            const user_id = sessionStorage.getItem('user_id');
            const bookingData = {
                construction_id: parseInt(selectedConstruction),
                shift_id: selectedShift.shift_id,
                user_id: user_id, 
            };

            await apiBooking.createBooking(bookingData);
            toast.success('予約が作成されました');
            setShowModal(false);
            setSelectedShift(null);
            setSelectedConstruction('');
        } catch (error) {
            console.error('Error creating booking:', error);
            toast.error('予約の作成に失敗しました');
        }
    };

    // Booking Modal Component
    const BookingModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">予約作成</h3>

                <form onSubmit={handleCreateBooking} className="space-y-4">
                    {/* Selected Shift Info */}
                    <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm font-medium">選択したシフト:</p>
                        <p className="text-sm">
                            日付: {format(new Date(selectedShift?.date), 'yyyy年MM月dd日')}
                        </p>
                        <p className="text-sm">
                            時間: {selectedShift?.start_time.slice(0, 5)} - {selectedShift?.end_time.slice(0, 5)}
                        </p>
                    </div>

                    {/* Construction Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            工事を選択
                        </label>
                        <select
                            value={selectedConstruction}
                            onChange={(e) => setSelectedConstruction(e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        >
                            <option value="">選択してください</option>
                            {constructions.map((construction) => (
                                <option key={construction.construction_id} value={construction.construction_id}>
                                    {construction.construction_code} - {construction.construction_name} - {construction.address}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                setSelectedShift(null);
                                setSelectedConstruction('');
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            予約する
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // Lấy các ngày trong tháng hiện tại
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    // Tạo hàng tuần
    const weeks = [];
    let week = [];

    // Thêm ngày trống vào đầu tháng
    const firstDayOfMonth = startOfMonth(currentDate).getDay();
    for (let i = 0; i < firstDayOfMonth; i++) {
        week.push(null);
    }

    // Thêm ngày trong tháng
    daysInMonth.forEach((day) => {
        week.push(day);
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    });

    // Thêm ngày trống vào cuối tháng
    if (week.length > 0) {
        for (let i = week.length; i < 7; i++) {
            week.push(null);
        }
        weeks.push(week);
    }

    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

    // Lọc ca làm việc cho một ngày cụ thể
    const getShiftsForDay = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return workShifts.filter(shift =>
            shift.active &&
            shift.date === dateStr
        );
    };

    return (
        <Layout>
            <div className="bg-gray-100 min-h-screen p-2 sm:p-4">
                <div className="bg-white p-3 sm:p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
                    <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">シフト予約</h2>

                    {loading ? (
                        <div className="text-center py-8">読み込み中...</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse table-fixed">
                                    <thead>
                                        <tr>
                                            {dayNames.map((day, index) => (
                                                <th key={index} className="border border-gray-300 p-1 sm:p-2 w-[14.28%]">
                                                    <div className={`text-center text-sm sm:text-base ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''}`}>
                                                        {day}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {weeks.map((week, weekIndex) => (
                                            <tr key={weekIndex}>
                                                {week.map((day, dayIndex) => (
                                                    <td
                                                        key={dayIndex}
                                                        className={`border border-gray-300 p-1 relative w-[14.28%] h-[120px] align-top ${day ? 'cursor-pointer hover:bg-blue-50' : 'bg-gray-50'
                                                            }`}
                                                    >
                                                        {day && (
                                                            <>
                                                                <div className={`text-right p-1 font-medium text-sm sm:text-base ${dayIndex === 0 ? 'text-red-500' : dayIndex === 6 ? 'text-blue-500' : ''
                                                                    }`}>
                                                                    {format(day, 'd')}
                                                                </div>
                                                                <div className="p-1 space-y-1 max-h-16 sm:max-h-28 overflow-y-auto">
                                                                    {getShiftsForDay(day).map(shift => (
                                                                        <div
                                                                            key={shift.shift_id}
                                                                            className="p-1 text-xs rounded border min-w-0 flex justify-between items-center break-words whitespace-normal overflow-hidden"
                                                                            style={{
                                                                                backgroundColor: shift.shift_name === '朝' ? '#dbeafe' :
                                                                                    shift.shift_name === '昼' ? '#dcfce7' :
                                                                                        shift.shift_name === '夜' ? '#f3e8ff' : '#f3f4f6',
                                                                                borderColor: shift.shift_name === '朝' ? '#93c5fd' :
                                                                                    shift.shift_name === '昼' ? '#86efac' :
                                                                                        shift.shift_name === '夜' ? '#d8b4fe' : '#d1d5db',
                                                                                color: shift.shift_name === '朝' ? '#1e40af' :
                                                                                    shift.shift_name === '昼' ? '#15803d' :
                                                                                        shift.shift_name === '夜' ? '#6b21a8' : '#374151'
                                                                            }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedShift(shift);
                                                                                setShowModal(true);
                                                                            }}
                                                                        >
                                                                            <span className="truncate flex-1 mr-1">
                                                                                {shift.shift_name} ({shift.start_time.slice(0, 5)}-{shift.end_time.slice(0, 5)})
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {showModal && selectedShift && <BookingModal />}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default GuestBookingPage;