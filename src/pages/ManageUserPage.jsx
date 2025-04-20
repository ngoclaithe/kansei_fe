import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import apiUser from '../services/apiUser';
import { Button, Table, Modal, Form, Input, Switch, Select, message, Popconfirm, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

const ManageUserPage = () => {
  // State để lưu trữ danh sách users
  const [users, setUsers] = useState([]);
  // State để theo dõi trạng thái loading
  const [loading, setLoading] = useState(false);
  // State cho modal thêm/sửa user
  const [isModalVisible, setIsModalVisible] = useState(false);
  // State để xác định đang thêm mới hay chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  // State lưu user đang được chỉnh sửa
  const [currentUser, setCurrentUser] = useState(null);
  // Form instance
  const [form] = Form.useForm();

  // Hàm lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiUser.getAllUsers();
      setUsers(data);
    } catch (error) {
      message.error('ユーザー情報の取得に失敗しました');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách người dùng khi component được mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Hiển thị modal thêm mới user
  const showAddModal = () => {
    setIsEditing(false);
    setCurrentUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Hiển thị modal chỉnh sửa user
  const showEditModal = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    form.setFieldsValue({
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      active: user.active,
      company_code: user.company?.company_code || '',
      company_name: user.company?.company_name || '',
      director_name: user.company?.director_name || '',
      address: user.company?.address || '',
    });
    setIsModalVisible(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Chuẩn bị dữ liệu người dùng
      const userData = {
        username: values.username,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        active: values.active,
      };

      // Nếu role là guest, thêm thông tin công ty
      if (values.role === 'guest') {
        userData.company = {
          company_code: values.company_code,
          company_name: values.company_name,
          director_name: values.director_name,
          address: values.address,
        };
      }

      if (isEditing) {
        // Cập nhật user
        await apiUser.updateUser(currentUser.user_id, userData);
        message.success('ユーザー情報が更新されました');
      } else {
        // Thêm password cho user mới
        userData.password = values.password;
        await apiUser.createUser(userData);
        message.success('新しいユーザーが作成されました');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error('処理に失敗しました');
      console.error('Error submitting form:', error);
    }
  };

  // Xử lý xóa user
  const handleDelete = async (userId) => {
    try {
      await apiUser.deleteUser(userId);
      message.success('ユーザーが削除されました');
      fetchUsers();
    } catch (error) {
      message.error('ユーザーの削除に失敗しました');
      console.error('Error deleting user:', error);
    }
  };

  // Định nghĩa các cột cho bảng
  const columns = [
    {
      title: 'ユーザー名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '氏名',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'メール',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '電話番号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '役割',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleMap = {
          admin: '管理者',
          manager: 'マネージャー',
          guest: 'ゲスト'
        };
        return roleMap[role] || role;
      }
    },
    {
      title: '会社',
      key: 'company',
      render: (_, record) => record.company ? record.company.company_name : '該当なし'
    },
    {
      title: '最終ログイン',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (lastLogin) => lastLogin ? new Date(lastLogin).toLocaleString('ja-JP') : '未ログイン'
    },
    {
      title: 'ステータス',
      dataIndex: 'active',
      key: 'active',
      render: (active) => active ? '有効' : '無効'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
            size="small"
          >
            編集
          </Button>
          <Popconfirm
            title="このユーザーを削除してもよろしいですか？"
            onConfirm={() => handleDelete(record.user_id)}
            okText="はい"
            cancelText="いいえ"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              削除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h1>ユーザー管理</h1>
          <div>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={fetchUsers} 
              style={{ marginRight: '8px' }}
            >
              更新
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showAddModal}
            >
              新規ユーザー
            </Button>
          </div>
        </div>

        <Spin spinning={loading}>
          <Table 
            columns={columns} 
            dataSource={users.map(user => ({ ...user, key: user.user_id }))} 
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        </Spin>

        <Modal
          title={isEditing ? 'ユーザー編集' : '新規ユーザー作成'}
          open={isModalVisible}
          onCancel={handleCancel}
          onOk={handleSubmit}
          okText={isEditing ? '更新' : '作成'}
          cancelText="キャンセル"
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="ユーザー名"
              rules={[{ required: true, message: 'ユーザー名を入力してください' }]}
            >
              <Input placeholder="ユーザー名を入力" />
            </Form.Item>
            
            {!isEditing && (
              <Form.Item
                name="password"
                label="パスワード"
                rules={[{ required: true, message: 'パスワードを入力してください' }]}
              >
                <Input.Password placeholder="パスワードを入力" />
              </Form.Item>
            )}
            
            <Form.Item
              name="full_name"
              label="氏名"
              rules={[{ required: true, message: '氏名を入力してください' }]}
            >
              <Input placeholder="氏名を入力" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="メール"
              rules={[
                { required: true, message: 'メールを入力してください' },
                { type: 'email', message: '有効なメールアドレスを入力してください' }
              ]}
            >
              <Input placeholder="メールを入力" />
            </Form.Item>
            
            <Form.Item
              name="phone"
              label="電話番号"
            >
              <Input placeholder="電話番号を入力" />
            </Form.Item>
            
            <Form.Item
              name="role"
              label="役割"
              rules={[{ required: true, message: '役割を選択してください' }]}
            >
              <Select placeholder="役割を選択">
                <Option value="admin">管理者</Option>
                <Option value="manager">マネージャー</Option>
                <Option value="guest">ゲスト</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="active"
              label="ステータス"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="有効" unCheckedChildren="無効" />
            </Form.Item>
            
            <Form.Item 
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
            >
              {({ getFieldValue }) => 
                getFieldValue('role') === 'guest' ? (
                  <div style={{ border: '1px solid #d9d9d9', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
                    <h3>会社情報</h3>
                    <Form.Item
                      name="company_code"
                      label="会社コード"
                      rules={[{ required: true, message: '会社コードを入力してください' }]}
                    >
                      <Input placeholder="会社コードを入力" />
                    </Form.Item>
                    
                    <Form.Item
                      name="company_name"
                      label="会社名"
                      rules={[{ required: true, message: '会社名を入力してください' }]}
                    >
                      <Input placeholder="会社名を入力" />
                    </Form.Item>
                    
                    <Form.Item
                      name="director_name"
                      label="代表者名"
                    >
                      <Input placeholder="代表者名を入力" />
                    </Form.Item>
                    
                    <Form.Item
                      name="address"
                      label="住所"
                    >
                      <Input.TextArea placeholder="住所を入力" rows={2} />
                    </Form.Item>
                  </div>
                ) : null
              }
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ManageUserPage;