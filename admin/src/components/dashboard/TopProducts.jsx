import { Card, Avatar, Tag } from 'antd';
import { mockProducts } from '../../data/mockData';

export const TopProducts = () => {
  return (
    <Card
      title={<span className="text-foreground">Top Products</span>}
      className="border-border"
      style={{ background: '#111111' }}
      extra={<a className="text-muted-foreground hover:text-foreground transition-colors">View All</a>}
    >
      <div className="space-y-4">
        {mockProducts.slice(0, 4).map((product) => (
          <div
            key={product.product_id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Avatar
              shape="square"
              size={48}
              src={product.cover_img}
              className="rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-foreground font-medium truncate m-0">{product.name}</h4>
              <p className="text-muted-foreground text-sm m-0">{product.category}</p>
            </div>
            <div className="text-right">
              <p className="text-foreground font-semibold m-0">${product.price}</p>
              <Tag color={product.stock_quantity === 0 ? 'red' : 'green'} className="capitalize m-0">
                {product.stock_quantity === 0 ? 'out of stock' : 'active'}
              </Tag>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
