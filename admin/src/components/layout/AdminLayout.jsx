import { Layout, ConfigProvider } from 'antd';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { antdDarkTheme } from '../../config/antdTheme';

const { Content } = Layout;

export const AdminLayout = ({ children, title }) => {
  return (
    <Layout className="min-h-screen">
      <AdminSidebar />
      <Layout>
        <AdminHeader title={title} />
        <Content
          className="p-6 overflow-auto"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #050505 100%)',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div className="animate-slide-up">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
