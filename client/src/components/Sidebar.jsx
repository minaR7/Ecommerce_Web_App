// components/Sidebar.jsx
import { Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useState } from 'react';
import NavigationLinks from './NavigationLinks';
import styled from 'styled-components';

const CustomDrawer = styled(Drawer)`
    .ant-drawer-body {
        padding: 20px;
    }
    .ant-drawer-content-wrapper {
        width: 240px !important; /* Customize drawer width */
    }
`;

const Sidebar = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex justify-between items-center px-4 py-3">
            {/* md:hidden  */}
            <MenuOutlined
                className="text-2xl cursor-pointer text-black"
                onClick={() => setOpen(true)}
            />
           
            <CustomDrawer
                title="Categories"
                placement="left"
                onClose={() => setOpen(false)}
                open={open}
            >
               
                <NavigationLinks onClick={() => setOpen(false)} isSidebar={true} />
            </CustomDrawer>
            {/* <div className="flex justify-center">
                <img
                    src="/assets/logo-jn.png.webp" // replace with your image path
                    alt="Logo"
                    className="object-contain"
                    style={{padding: "1rem 1rem 1rem 3rem", height: "80px", width: "480px"}}
                />
            </div> */}
        </div>
    );
};

export default Sidebar;
