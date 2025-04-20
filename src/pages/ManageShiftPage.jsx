import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import workShiftApi from '../services/apiWorkShift';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, parse, setMonth, setYear } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast } from 'react-toastify';

const ManageShiftPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workShifts, setWorkShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingShift, setEditingShift] = useState(null);
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
  }, []);

  const fetchWorkShifts = async () => {
    try {
      setLoading(true);
      const response = await workShiftApi.getWorkShifts();
      setWorkShifts(response.data);
    } catch (error) {
      console.error('Error fetching work shifts:', error);
      toast.error('シフトデータの読み込みに失敗しました');
    } finally {
      setLoading(false);
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
      toast.success('シフトを作成しました！');
      resetForm();
      fetchWorkShifts();
      setShowModal(false);
    } catch (error) {
      console.error('Error creating shift:', error);
      console.error('Error response:', error.response?.data);
      toast.error('シフトの作成に失敗しました');
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
      
      await workShiftApi.updateWorkShift(editingShift.shift_id, apiData);
      toast.success('シフトを更新しました！');
      resetForm();
      fetchWorkShifts();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating shift:', error);
      console.error('Error response:', error.response?.data);
      toast.error('シフトの更新に失敗しました');
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (window.confirm('このシフトを削除してもよろしいですか？')) {
      try {
        await workShiftApi.deleteWorkShift(shiftId);
        toast.success('シフトを削除しました！');
        fetchWorkShifts();
      } catch (error) {
        console.error('Error deleting shift:', error);
        toast.error('シフトの削除に失敗しました');
      }
    }
  };

  const openModal = (shift = null, selectedDate = null) => {
    if (shift) {
      setEditingShift(shift);
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

  const resetForm = () => {
    setEditingShift(null);
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

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  // Lọc ca làm việc cho một ngày cụ thể
  const getShiftsForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return workShifts.filter(shift => 
      shift.active && 
      shift.date === dateStr
    );
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

  // Tạo mảng năm cho dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear - 2 + i);
  
  // Tạo mảng tháng cho dropdown
  const months = Array.from({length: 12}, (_, i) => i);

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-2 sm:p-4">
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">シフト管理</h2>
          
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
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
                      <option key={year} value={year}>{year}年</option>
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
                        {format(new Date(2000, month, 1), 'MMMM', { locale: ja })}
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
                              day ? 'cursor-pointer hover:bg-blue-50' : 'bg-gray-50'
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
                                        openModal(shift);
                                      }}
                                    >
                                      <span className="truncate flex-1 mr-1">
                                        {shift.shift_name} ({formatTimeForDisplay(shift.start_time)}-{formatTimeForDisplay(shift.end_time)})
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteShift(shift.shift_id);
                                        }}
                                        className="flex-shrink-0 ml-1 text-red-500 hover:text-red-700"
                                      >
                                        ×
                                      </button>
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

              {/* Chú thích */}
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border border-blue-300 rounded mr-1 sm:mr-2"></span>
                  朝 (8:00-12:00)
                </div>
                <div>
                  <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border border-green-300 rounded mr-1 sm:mr-2"></span>
                  昼 (13:00-17:00)
                </div>
                <div>
                  <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-purple-100 border border-purple-300 rounded mr-1 sm:mr-2"></span>
                  夜 (18:00-22:00)
                </div>
              </div>

              {/* Modal tạo/chỉnh sửa ca làm việc */}
              {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                      {editingShift ? 'シフト編集' : 'シフト作成'}
                    </h3>
                    
                    <form onSubmit={editingShift ? handleUpdateShift : handleCreateShift} className="space-y-3 sm:space-y-4">
                      {/* Chọn ngày - Tùy chọn, có thể để trống */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          日付 (任意)
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">空白の場合、日付はサーバーで自動設定されます</p>
                      </div>
                      
                      {/* Chọn loại ca - Đã sửa để ẩn các nút ca đã tồn tại */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">シフトタイプ</label>
                        <div className="flex flex-wrap gap-2">
                          {!formData.date ? (
                            <p className="text-xs text-gray-500">日付を選択してください</p>
                          ) : (
                            <>
                              {!isShiftTypeExistForDate('morning', formData.date) && (
                                <button
                                  type="button"
                                  onClick={() => handleShiftTypeSelect('morning')}
                                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded"
                                >
                                  朝 (8:00-12:00)
                                </button>
                              )}
                              {!isShiftTypeExistForDate('afternoon', formData.date) && (
                                <button
                                  type="button"
                                  onClick={() => handleShiftTypeSelect('afternoon')}
                                  className="bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded"
                                >
                                  昼 (13:00-17:00)
                                </button>
                              )}
                              {!isShiftTypeExistForDate('evening', formData.date) && (
                                <button
                                  type="button"
                                  onClick={() => handleShiftTypeSelect('evening')}
                                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded"
                                >
                                  夜 (18:00-22:00)
                                </button>
                              )}
                              {(isShiftTypeExistForDate('morning', formData.date) && 
                                isShiftTypeExistForDate('afternoon', formData.date) && 
                                isShiftTypeExistForDate('evening', formData.date)) && (
                                <p className="text-xs text-orange-500">この日のすべてのシフトタイプが既に作成されています</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Tên ca làm việc */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">シフト名</label>
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
                          <label className="block text-sm font-medium text-gray-700">開始時間</label>
                          <input
                            type="time"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">秒 (00) が自動的に追加されます</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">終了時間</label>
                          <input
                            type="time"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">秒 (00) が自動的に追加されます</p>
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
                        <label className="ml-2 block text-sm text-gray-700">有効</label>
                      </div>
                      
                      {/* Các nút tác vụ của form */}
                      <div className="flex justify-end space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="bg-gray-500 text-white px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-gray-600"
                        >
                          キャンセル
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-500 text-white px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-blue-600"
                        >
                          {editingShift ? '更新' : '作成'}
                        </button>
                      </div>
                    </form>
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

export default ManageShiftPage;