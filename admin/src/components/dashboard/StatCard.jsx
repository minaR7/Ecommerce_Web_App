import { Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

export const StatCard = ({ title, value, change, icon, prefix = '' }) => {
  const isPositive = change >= 0;

  return (
    <Card
      className="stat-card border-border hover:border-muted-foreground transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, #111111 0%, #0a0a0a 100%)',
      }}
      bordered
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-2">{title}</p>
          <h3 className="text-2xl font-bold text-foreground m-0">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <span>{Math.abs(change)}%</span>
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-accent text-foreground">
          {icon}
        </div>
      </div>
    </Card>
  );
};
