import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import apiBooking from '../services/apiBooking';
import workShiftApi from '../services/apiWorkShift';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, parse, setMonth, setYear } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast } from 'react-toastify';

const ManageBookingPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workShifts, setWorkShifts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    shift_name: '',
    start_time: '',
    end_time: '',
    active: true,
    date: null
  });
  
  // Các loại ca làm việc định sẵn
  const shiftTypes = {
    morning: { name: '朝', start_time: '08:00', end_time: '12:00' },
    afternoon: { name: '昼', start_time: '13:00', end_time: '17:00' },
    evening: { name: '夜', start_time: '18:00', end_time: '22:00' }
  };

  useEffect(() => {
    fetchWorkShifts();
    fetchAllBookings();
  }, []);

  const fetchWorkShifts = async () => {
    try {
      setLoading(true);
      const response = await workShiftApi.getWorkShifts();
      setWorkShifts(response.data);
    } catch (error) {
      console.error('Error fetching work shifts:', error);
      // toast.error('Không thể tải dữ liệu ca làm việc');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAllBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await apiBooking.getBookingsByAdmin();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // toast.error('Không thể tải dữ liệu đặt ca');
    } finally {
      setLoadingBookings(false);
    }
  };

  // Phê duyệt booking
  const handleApproveBooking = async (bookingId) => {
    try {
      await apiBooking.updateBookingStatus(bookingId, { status: 'approved' });
      toast.success('シフト申請を承認しました');
      fetchAllBookings();
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('シフト申請を承認できませんでした');
    }
  };

  // Từ chối booking
  const handleRejectBooking = async (bookingId) => {
    try {
      await apiBooking.updateBookingStatus(bookingId, { status: 'rejected' });
      toast.success('シフト申請を却下しました');
      fetchAllBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('シフト申請を却下できませんでした');
    }
  };
  
  // Định dạng thời gian cho API
  const formatTimeForApi = (timeString) => {
    if (!timeString) return '';
    // Đảm bảo chỉ có giờ và phút (HH:MM)
    const [hours, minutes] = timeString.split(':');
    // Trả về định dạng HH:MM:00
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    
    console.log('=== DEBUG CREATE SHIFT ===');
    console.log('Original formData.date:', formData.date);
    console.log('Type of formData.date:', typeof formData.date);
    
    try {
      const apiData = {
        ...formData,
        start_time: formatTimeForApi(formData.start_time),
        end_time: formatTimeForApi(formData.end_time),
        date: formData.date && typeof formData.date === 'string' && formData.date.trim() !== '' 
              ? formData.date 
              : null
      };
      
      console.log('API data being sent:', apiData);
      console.log('API data.date:', apiData.date);
      
      await workShiftApi.createWorkShift(apiData);
      toast.success('新しいシフトを作成しました！');
      resetForm();
      fetchWorkShifts();
      setShowModal(false);
    } catch (error) {
      console.error('Error creating shift:', error);
      console.error('Error response:', error.response?.data);
      toast.error('シフトを作成できませんでした');
    }
  };

  const handleUpdateShift = async (e) => {
    e.preventDefault();
    
    console.log('=== DEBUG UPDATE SHIFT ===');
    console.log('Original formData.date:', formData.date);
    console.log('Type of formData.date:', typeof formData.date);
    
    try {
      const apiData = {
        ...formData,
        start_time: formatTimeForApi(formData.start_time),
        end_time: formatTimeForApi(formData.end_time),
        date: formData.date && typeof formData.date === 'string' && formData.date.trim() !== '' 
              ? formData.date 
              : null
      };
      
      console.log('API data being sent:', apiData);
      console.log('API data.date:', apiData.date);
      
      await workShiftApi.updateWorkShift(selectedShift.shift_id, apiData);
      toast.success('シフトを更新しました！');
      resetForm();
      fetchWorkShifts();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating shift:', error);
      console.error('Error response:', error.response?.data);
      toast.error('シフトを更新できませんでした');
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (window.confirm('Bạn có chắc muốn xóa ca làm việc này?')) {
      try {
        await workShiftApi.deleteWorkShift(shiftId);
        toast.success('シフトを削除しました！');
        fetchWorkShifts();
      } catch (error) {
        console.error('Error deleting shift:', error);
        toast.error('シフトを削除できませんでした');
      }
    }
  };

  const openModal = (shift = null, selectedDate = null) => {
    if (shift) {
      setSelectedShift(shift);
      setFormData({
        shift_name: shift.shift_name,
        start_time: formatTimeForInput(shift.start_time),
        end_time: formatTimeForInput(shift.end_time),
        active: shift.active,
        date: shift.date
      });
    } else {
      resetForm();
      if (selectedDate) {
        setFormData(prev => ({
          ...prev,
          date: format(selectedDate, 'yyyy-MM-dd')
        }));
      }
    }
    setShowModal(true);
  };

  // Hiển thị modal cho booking
  const openBookingModal = (shift) => {
    setSelectedShift(shift);
    setShowBookingModal(true);
  };

  const resetForm = () => {
    setSelectedShift(null);
    setFormData({
      shift_name: '',
      start_time: '',
      end_time: '',
      active: true,
      date: null
    });
  };

  // Định dạng thời gian cho hiển thị trong UI
  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    // Tách chuỗi thời gian và chỉ lấy hai phần đầu (giờ và phút)
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return timeString;
  };

  // Định dạng thời gian để hiển thị trong lịch
  const formatTimeForDisplay = (timeString) => {
    return formatTimeForInput(timeString);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'date' && value === '') {
      setFormData({
        ...formData,
        date: null
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleShiftTypeSelect = (type) => {
    const selectedShift = shiftTypes[type];
    setFormData({
      ...formData,
      shift_name: selectedShift.name,
      start_time: selectedShift.start_time,
      end_time: selectedShift.end_time
    });
  };

  // Xử lý thay đổi năm
  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    if (!isNaN(year)) {
      const newDate = setYear(currentDate, year);
      setCurrentDate(newDate);
    }
  };
  
  // Xử lý thay đổi tháng
  const handleMonthChange = (e) => {
    const month = parseInt(e.target.value);
    if (!isNaN(month)) {
      const newDate = setMonth(currentDate, month);
      setCurrentDate(newDate);
    }
  };

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

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Lọc ca làm việc cho một ngày cụ thể
  const getShiftsForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return workShifts.filter(shift => 
      shift.active && 
      shift.date === dateStr
    );
  };

  // Lấy số lượng booking cho một ca làm việc
  const getBookingsCountForShift = (shiftId) => {
    return bookings.filter(booking => booking.work_shift.shift_id === shiftId).length;
  };

  // Lấy danh sách booking cho một ca làm việc
  const getBookingsForShift = (shiftId) => {
    return bookings.filter(booking => booking.work_shift.shift_id === shiftId);
  };

  // Lấy lớp màu dựa trên tên ca
  const getShiftColorClass = (shiftName) => {
    if (shiftName === '朝') return 'bg-blue-100 border-blue-300 text-blue-800';
    if (shiftName === '昼') return 'bg-green-100 border-green-300 text-green-800';
    if (shiftName === '夜') return 'bg-purple-100 border-purple-300 text-purple-800';
    return 'bg-gray-100 border-gray-300 text-gray-800';
  };
  
  // Kiểm tra xem một loại ca đã tồn tại cho ngày đã chọn chưa
  const isShiftTypeExistForDate = (type, selectedDate) => {
    if (!selectedDate) return false;
    
    const dateStr = typeof selectedDate === 'string' ? selectedDate : format(selectedDate, 'yyyy-MM-dd');
    const shiftsForDay = workShifts.filter(shift => shift.active && shift.date === dateStr);
    
    const selectedShift = shiftTypes[type];
    
    return shiftsForDay.some(shift => 
      shift.start_time === formatTimeForApi(selectedShift.start_time) && 
      shift.end_time === formatTimeForApi(selectedShift.end_time)
    );
  };

  // Lấy màu trạng thái booking
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-yellow-600'; // pending
    }
  };

  // Dịch trạng thái booking
  const translateStatus = (status) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Đã từ chối';
      case 'cancelled': return 'Đã hủy';
      default: return 'Chờ duyệt'; // pending
    }
  };

  // Dịch trạng thái booking sang tiếng Nhật
  const translateStatusJP = (status) => {
    switch (status) {
      case 'approved': return '承認済み';
      case 'rejected': return '拒否済み';
      case 'cancelled': return 'キャンセル済み';
      case 'completed': return '完了';
      default: return '承認待ち'; // pending
    }
  };

  // Lấy màu cho badge trạng thái
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800'; // pending
    }
  };

  // Tạo mảng năm cho dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear - 2 + i);
  
  // Tạo mảng tháng cho dropdown
  const months = Array.from({length: 12}, (_, i) => i);

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-2 sm:p-4">
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
            予約管理システム
          </h2>
          
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : (
            <>
              {/* Phần lịch với dropdown chọn năm và tháng */}
              <div className="flex flex-wrap justify-center items-center mb-3 sm:mb-4 gap-3">
                <div className="flex items-center">
                  <select
                    value={currentDate.getFullYear()}
                    onChange={handleYearChange}
                    className="bg-white border border-gray-300 text-gray-700 py-1 px-2 sm:py-2 sm:px-3 rounded leading-tight focus:outline-none focus:border-blue-500"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <select
                    value={currentDate.getMonth()}
                    onChange={handleMonthChange}
                    className="bg-white border border-gray-300 text-gray-700 py-1 px-2 sm:py-2 sm:px-3 rounded leading-tight focus:outline-none focus:border-blue-500"
                  >
                    {months.map(month => (
                      <option key={month} value={month}>
                        Tháng {month + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                            className={`border border-gray-300 p-1 relative w-[14.28%] h-[120px] align-top ${
                              day ? 'hover:bg-blue-50' : 'bg-gray-50'
                            }`}
                            onClick={() => day && openModal(null, day)}
                          >
                            {day && (
                              <>
                                <div className={`text-right p-1 font-medium text-sm sm:text-base ${
                                  dayIndex === 0 ? 'text-red-500' : dayIndex === 6 ? 'text-blue-500' : ''
                                }`}>
                                  {format(day, 'd')}
                                </div>
                                <div className="p-1 space-y-1 max-h-16 sm:max-h-28 overflow-y-auto">
                                  {getShiftsForDay(day).map(shift => {
                                    const bookingsCount = getBookingsCountForShift(shift.shift_id);
                                    return (
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
                                          openBookingModal(shift);
                                        }}
                                      >
                                        <span className="truncate flex-grow">
                                          {shift.shift_name} ({formatTimeForDisplay(shift.start_time)}-{formatTimeForDisplay(shift.end_time)})
                                        </span>
                                        {bookingsCount > 0 && (
                                          <span className="ml-2 px-1.5 py-0.5 bg-white rounded-full text-xs font-medium">
                                            {bookingsCount}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
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

              {/* Chú thích */}
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border border-blue-300 rounded mr-1 sm:mr-2"></span>
                  Ca sáng (8:00-12:00)
                </div>
                <div>
                  <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border border-green-300 rounded mr-1 sm:mr-2"></span>
                  Ca chiều (13:00-17:00)
                </div>
                <div>
                  <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-purple-100 border border-purple-300 rounded mr-1 sm:mr-2"></span>
                  Ca tối (18:00-22:00)
                </div>
              </div>

              {/* Modal tạo/chỉnh sửa ca làm việc */}
              {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                      {selectedShift ? 'Chỉnh sửa ca làm việc' : 'Tạo ca làm việc mới'}
                    </h3>
                    
                    <form onSubmit={selectedShift ? handleUpdateShift : handleCreateShift} className="space-y-3 sm:space-y-4">
                      {/* Chọn ngày - Tùy chọn, có thể để trống */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ngày (tùy chọn)
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">Nếu để trống, ngày sẽ được tự động thiết lập bởi hệ thống</p>
                      </div>
                      
                      {/* Chọn loại ca - Đã sửa để ẩn các nút ca đã tồn tại */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại ca</label>
                        <div className="flex flex-wrap gap-2">
                          {!formData.date ? (
                            <p className="text-xs text-gray-500">Vui lòng chọn ngày trước</p>
                          ) : (
                            <>
                              {!isShiftTypeExistForDate('morning', formData.date) && (
                                <button
                                  type="button"
                                  onClick={() => handleShiftTypeSelect('morning')}
                                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded"
                                >
                                  Ca sáng (8:00-12:00)
                                </button>
                              )}
                              {!isShiftTypeExistForDate('afternoon', formData.date) && (
                                <button
                                  type="button"
                                  onClick={() => handleShiftTypeSelect('afternoon')}
                                  className="bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded"
                                >
                                  Ca chiều (13:00-17:00)
                                </button>
                              )}
                              {!isShiftTypeExistForDate('evening', formData.date) && (
                                <button
                                  type="button"
                                  onClick={() => handleShiftTypeSelect('evening')}
                                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded"
                                >
                                  Ca tối (18:00-22:00)
                                </button>
                              )}
                              {(isShiftTypeExistForDate('morning', formData.date) && 
                                isShiftTypeExistForDate('afternoon', formData.date) && 
                                isShiftTypeExistForDate('evening', formData.date)) && (
                                <p className="text-xs text-orange-500">Tất cả các loại ca cho ngày này đã được tạo</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Tên ca làm việc */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tên ca</label>
                        <input
                          type="text"
                          name="shift_name"
                          value={formData.shift_name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                        />
                      </div>
                      
                      {/* Nhập thời gian */}
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Thời gian bắt đầu</label>
                          <input
                            type="time"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Thời gian kết thúc</label>
                          <input
                            type="time"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                          />
                        </div>
                      </div>
                      
                      {/* Trạng thái kích hoạt */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="active"
                          checked={formData.active}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">Kích hoạt</label>
                      </div>
                      
                      {/* Các nút tác vụ của form */}
                      <div className="flex justify-end space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="bg-gray-500 text-white px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-gray-600"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-500 text-white px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-blue-600"
                        >
                          {selectedShift ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Modal hiển thị danh sách booking cho ca làm việc */}
              {showBookingModal && selectedShift && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold">
                        予約一覧: {selectedShift.shift_name} ({formatTimeForDisplay(selectedShift.start_time)}-{formatTimeForDisplay(selectedShift.end_time)})
                      </h3>
                      <div className="text-sm font-medium">
                        日付: {format(new Date(selectedShift.date), 'yyyy年MM月dd日')}
                      </div>
                    </div>

                    {loadingBookings ? (
                      <div className="text-center py-8">読み込み中...</div>
                    ) : (
                      <>
                        {getBookingsForShift(selectedShift.shift_id).length === 0 ? (
                          <div className="text-center py-8 text-gray-500">予約がありません</div>
                        ) : (
                          <div className="space-y-4">
                            {getBookingsForShift(selectedShift.shift_id).map((booking) => (
                              <div
                                key={booking.booking_id}
                                className="border rounded-lg p-4 bg-gray-50"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="space-y-2">
                                    <div>
                                      <span className="font-medium">工事名:</span>
                                      <span className="ml-2">{booking.construction.construction_name}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">場所:</span>
                                      <span className="ml-2">{booking.construction.address}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">予約者:</span>
                                      <span className="ml-2">{booking.user.username}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeColor(booking.status)}`}>
                                      {translateStatusJP(booking.status)}
                                    </span>
                                  </div>
                                </div>

                                {booking.status === 'pending' && (
                                  <div className="mt-4 flex justify-end gap-2">
                                    <button
                                      onClick={() => handleApproveBooking(booking.booking_id)}
                                      className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
                                    >
                                      承認
                                    </button>
                                    <button
                                      onClick={() => handleRejectBooking(booking.booking_id)}
                                      className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
                                    >
                                      拒否
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          setShowBookingModal(false);
                          setSelectedShift(null);
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        閉じる
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ManageBookingPage;