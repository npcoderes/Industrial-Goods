const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard", role: "Admin" },
    { name: "Profile", path: "/profile", role: "Admin" },
    { name: "Manage Users", path: "/admin/users", role: "Admin" },
    { name: "Manage Categories", path: "/managecategory", role: "Admin" },
    { name: "Manage Products", path: "/manageproduct", role: "Admin" },
    { name: "Manage Orders", path: "/manageorder", role: "Admin" },
    { name: "Settings", path: "/settings", role: "Admin" },
];

const customerLinks = [
    { name: "Home", path: "/", role: "Customer" },
    { name:"PurchaseHistory", path:"/PurchaseHistory", role:"Customer"},
    { name: "Profile", path: "/profile", role: "Customer" },
    { name: "Settings", path: "/settings", role: "Customer" },
];
const navLinks = [...adminLinks, ...customerLinks];

export default navLinks;
