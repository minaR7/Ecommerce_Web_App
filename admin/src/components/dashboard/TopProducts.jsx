import { useEffect, useState } from 'react';
import { Card, Avatar, Tag, Spin, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../../services/api';

// Best Sellers — same ranking as the storefront's "Best Sellers" carousel,
// driven by the shared /api/products/best-sellers endpoint.
export const TopProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    productsApi
      .getBestSellers()
      .then((data) => {
        if (active) setProducts(Array.isArray(data) ? data.slice(0, 5) : []);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <Card
      title={<span className="text-foreground">Best Sellers</span>}
      className="border-border"
      style={{ background: '#111111' }}
      extra={
        <a
          className="text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate('/products')}
        >
          View All
        </a>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin />
        </div>
      ) : products.length === 0 ? (
        <Empty description="No sales yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className="space-y-4">
          {products.map((product) => {
            const price = Number(product.discounted_price ?? product.price ?? 0);
            const sold = Number(product.total_sold ?? 0);
            const rating = Number(product.avg_rating ?? 0);
            return (
              <div
                key={product.product_id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate('/products')}
              >
                <Avatar
                  shape="square"
                  size={48}
                  src={product.cover_img}
                  className="rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-foreground font-medium truncate m-0">{product.name}</h4>
                  <p className="text-muted-foreground text-sm m-0">
                    {sold} sold{rating > 0 ? ` · ★ ${rating}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-foreground font-semibold m-0">€{price.toFixed(2)}</p>
                  <Tag color="green" className="m-0">Best Seller</Tag>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
