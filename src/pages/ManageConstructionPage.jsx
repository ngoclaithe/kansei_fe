import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import constructionApi from '../services/apiConstruction';
import { Button, Table, Modal, Form, Input, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const ManageConstructionPage = () => {
  const [constructions, setConstructions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConstruction, setEditingConstruction] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchConstructions();
  }, []);

  const fetchConstructions = async () => {
    setLoading(true);
    try {
      const { data } = await constructionApi.getConstructions();
      setConstructions(data);
    } catch (error) {
      message.error('工事一覧の取得に失敗しました。');
      console.error('Error fetching constructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setEditingConstruction(null);
    setModalVisible(true);
  };

  const showEditModal = (record) => {
    form.setFieldsValue({
      construction_name: record.construction_name,
      director_name: record.director_name,
      address: record.address,
      active: record.active
    });
    setEditingConstruction(record);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingConstruction) {
        await constructionApi.updateConstruction(editingConstruction.construction_id, values);
        message.success('工事情報が更新されました。');
      } else {
        await constructionApi.createConstruction(values);
        message.success('工事が追加されました。');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchConstructions();
    } catch (error) {
      console.error('Form submission error:', error);
      message.error('提出に失敗しました。入力内容を確認してください。');
    }
  };

  const handleDelete = async (constructionId) => {
    try {
      await constructionApi.deleteConstruction(constructionId);
      message.success('工事が削除されました。');
      fetchConstructions();
    } catch (error) {
      message.error('削除に失敗しました。');
      console.error('Error deleting construction:', error);
    }
  };

  const columns = [
    {
      title: '工事コード',
      dataIndex: 'construction_code',
      key: 'construction_code',
    },
    {
      title: '工事名',
      dataIndex: 'construction_name',
      key: 'construction_name',
    },
    {
      title: '担当者',
      dataIndex: 'director_name',
      key: 'director_name',
    },
    {
      title: '住所',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '状態',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (active ? '有効' : '無効'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            size="small"
          >
            編集
          </Button>
          <Popconfirm
            title="この工事を削除してもよろしいですか？"
            onConfirm={() => handleDelete(record.construction_id)}
            okText="はい"
            cancelText="いいえ"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              削除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">工事管理</h1>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showAddModal}
            >
              新規工事
            </Button>
          </div>
          
          <Table
            columns={columns}
            dataSource={constructions}
            rowKey="construction_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </div>

        <Modal
          title={editingConstruction ? '工事情報の編集' : '新規工事の追加'}
          open={modalVisible}
          onCancel={handleCancel}
          onOk={handleSubmit}
          okText={editingConstruction ? '更新' : '追加'}
          cancelText="キャンセル"
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="construction_name"
              label="工事名"
              rules={[{ required: true, message: '工事名を入力してください' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="director_name"
              label="担当者"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="address"
              label="住所"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="active"
              label="有効"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="有効" unCheckedChildren="無効" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ManageConstructionPage;