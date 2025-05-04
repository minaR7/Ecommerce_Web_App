// components/Sidebar.jsx
import { Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useState } from 'react';
import NavigationLinks from './NavigationLinks';

const Sidebar = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden flex justify-between items-center bg-white shadow px-4 py-3">
            <div className="text-2xl font-bold">MyStore</div>
            <MenuOutlined
                className="text-2xl cursor-pointer"
                onClick={() => setOpen(true)}
            />
            <Drawer
                title="Categories"
                placement="left"
                onClose={() => setOpen(false)}
                open={open}
            >
                <NavigationLinks onClick={() => setOpen(false)} />
            </Drawer>
        </div>
    );
};

export default Sidebar;
