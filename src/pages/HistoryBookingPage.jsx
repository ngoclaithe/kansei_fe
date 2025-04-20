import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import apiBooking from '../services/apiBooking';
import { Table, message, Select, Space, Button, Popconfirm } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const HistoryBookingPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [bookings, statusFilter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const user_id = sessionStorage.getItem('user_id');
            const { data } = await apiBooking.getBookingsByUserId(user_id);
            setBookings(data);
            setFilteredBookings(data);
        } catch (error) {
            message.error('予約履歴の取得に失敗しました。');
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterBookings = () => {
        if (statusFilter === 'all') {
            setFilteredBookings(bookings);
        } else {
            const filtered = bookings.filter(booking => booking.status === statusFilter);
            setFilteredBookings(filtered);
        }
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            await apiBooking.cancelBooking(bookingId);
            message.success('予約がキャンセルされました。');
            fetchBookings(); // Refresh the bookings list after cancellation
        } catch (error) {
            message.error('予約キャンセルに失敗しました。');
            console.error('Error cancelling booking:', error);
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': '保留中',
            'approved': '承認済み',
            'rejected': '拒否された',
            'cancelled': 'キャンセル',
        };
        return statusMap[status] || status;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP');
    };

    const formatTime = (timeString) => {
        return timeString.substring(0, 5);
    };

    const columns = [
        {
            title: '予約ID',
            dataIndex: 'booking_id',
            key: 'booking_id',
        },
        {
            title: '工事名',
            dataIndex: ['construction', 'construction_name'],
            key: 'construction_name',
        },
        {
            title: '工事コード',
            dataIndex: ['construction', 'construction_code'],
            key: 'construction_code',
        },
        {
            title: '住所',
            dataIndex: ['construction', 'address'],
            key: 'address',
        },
        {
            title: 'シフト名',
            dataIndex: ['work_shift', 'shift_name'],
            key: 'shift_name',
        },
        {
            title: '日付',
            dataIndex: ['work_shift', 'date'],
            key: 'date',
            render: (date) => formatDate(date),
        },
        {
            title: '時間',
            key: 'time',
            render: (_, record) => (
                `${formatTime(record.work_shift.start_time)} - ${formatTime(record.work_shift.end_time)}`
            ),
        },
        {
            title: 'ステータス',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusText(status),
        },
        {
            title: '予約日',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => formatDate(date),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                record.status === 'pending' ? (
                    <Popconfirm
                        title="この予約をキャンセルしてもよろしいですか？"
                        onConfirm={() => handleCancelBooking(record.booking_id)}
                        okText="はい"
                        cancelText="いいえ"
                    >
                        <Button 
                            type="danger" 
                            icon={<CloseCircleOutlined />} 
                            size="small"
                            danger
                        >
                            キャンセル
                        </Button>
                    </Popconfirm>
                ) : null
            ),
        }
    ];

    return (
        <Layout>
            <div className="bg-gray-100 min-h-screen p-6">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">予約履歴</h1>
                        <Space>
                            <span>ステータスでフィルター:</span>
                            <Select 
                                defaultValue="all" 
                                style={{ width: 150 }} 
                                onChange={handleStatusChange}
                            >
                                <Option value="all">すべて</Option>
                                <Option value="pending">保留中</Option>
                                <Option value="approved">承認済み</Option>
                                <Option value="rejected">拒否された</Option>
                                <Option value="cancelled">キャンセル</Option>
                            </Select>
                        </Space>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={filteredBookings}
                        rowKey="booking_id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default HistoryBookingPage;