import { Row, Col } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '../components/layout/AdminLayout';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentOrders } from '../components/dashboard/RecentOrders';
import { TopProducts } from '../components/dashboard/TopProducts';
import { mockDashboardStats } from '../data/mockData';

const Dashboard = () => {
  const stats = mockDashboardStats;

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Revenue"
              value={stats.totalRevenue.toFixed(2)}
              change={stats.revenueChange}
              icon={<DollarOutlined className="text-2xl" />}
              prefix="$"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              change={stats.ordersChange}
              icon={<ShoppingCartOutlined className="text-2xl" />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              change={stats.productsChange}
              icon={<ShoppingOutlined className="text-2xl" />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              change={stats.usersChange}
              icon={<UserOutlined className="text-2xl" />}
            />
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <RecentOrders />
          </Col>
          <Col xs={24} lg={10}>
            <TopProducts />
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
