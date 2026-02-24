import { Card, Form, Input, Button, Switch, Divider, message } from 'antd';
import { AdminLayout } from '../components/layout/AdminLayout';

const Settings = () => {
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success('Settings saved successfully');
  };

  return (
    <AdminLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        <Card
          title={<span className="text-foreground">Store Settings</span>}
          className="border-border"
          style={{ background: '#111111' }}
        >
          <Form form={form} layout="vertical">
            <Form.Item label="Store Name" name="storeName" initialValue="My E-Commerce Store">
              <Input placeholder="Enter store name" />
            </Form.Item>
            <Form.Item label="Store Email" name="storeEmail" initialValue="admin@store.com">
              <Input placeholder="Enter store email" />
            </Form.Item>
            <Form.Item label="Store Address" name="storeAddress" initialValue="123 Main St, New York, NY">
              <Input.TextArea rows={2} placeholder="Enter store address" />
            </Form.Item>
          </Form>
        </Card>

        <Card
          title={<span className="text-foreground">Notifications</span>}
          className="border-border"
          style={{ background: '#111111' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium m-0">Email Notifications</p>
                <p className="text-muted-foreground text-sm m-0">Receive email notifications for new orders</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Divider className="border-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium m-0">Low Stock Alerts</p>
                <p className="text-muted-foreground text-sm m-0">Get notified when products are running low</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Divider className="border-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium m-0">Order Updates</p>
                <p className="text-muted-foreground text-sm m-0">Send customers order status updates</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="primary" onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
