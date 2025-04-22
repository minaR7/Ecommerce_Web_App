import React, { useState } from 'react';
import { Layout, Menu, Drawer, Button, Card, Row, Col } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

const App = () => {
  const [visible, setVisible] = useState(false);

  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);

  return (
    <Layout>
      <Header>
        <Button type="text" icon={<MenuOutlined />} onClick={showDrawer} />
        <Drawer placement="left" onClose={closeDrawer} visible={visible}>
          <Menu mode="inline">
            <Menu.Item key="1">Home</Menu.Item>
            <Menu.Item key="2">Shop</Menu.Item>
            <Menu.Item key="3">About Us</Menu.Item>
            <Menu.Item key="4">Contact</Menu.Item>
          </Menu>
        </Drawer>
      </Header>

      <Content style={{ padding: '0 50px', marginTop: 64 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card title="Jabador" bordered={false}>Product 1</Card>
          </Col>
          <Col span={8}>
            <Card title="Gandoura" bordered={false}>Product 2</Card>
          </Col>
          <Col span={8}>
            <Card title="Djellaba" bordered={false}>Product 3</Card>
          </Col>
        </Row>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        © 2025 Jabador. All rights reserved.
      </Footer>
    </Layout>
  );
};

export default App;
