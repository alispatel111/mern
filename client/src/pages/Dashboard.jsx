"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import {
  Home,
  Users,
  ShoppingCart,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  BarChart2,
  DollarSign,
  ShoppingBag,
  UserPlus,
  Activity,
  Calendar,
  Mail,
  MessageSquare,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  Camera,
  Phone,
  MapPin,
  Briefcase,
  Globe,
  Save,
  Clock,
  Cake,
  AtSign,
  CheckCircle,
  LogIn,
  Package,
  TrendingUp,
  CreditCard,
  Star,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  Grid,
  List,
  SlidersHorizontal,
} from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from "chart.js"
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2"
import { format, subDays } from "date-fns"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "../styles/dashboard.css"
import { API_ENDPOINTS, makeRequest } from "../server.js"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
)

// Sample data for charts and tables
const generateDailyData = (days = 30) => {
  const data = []
  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), i)
    data.unshift({
      date: format(date, "MMM dd"),
      revenue: Math.floor(Math.random() * 5000) + 1000,
      orders: Math.floor(Math.random() * 50) + 10,
      visitors: Math.floor(Math.random() * 500) + 100,
    })
  }
  return data
}

const generateProductData = () => {
  const categories = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Beauty", "Sports", "Toys"]
  const products = []

  for (let i = 1; i <= 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const stock = Math.floor(Math.random() * 100)
    products.push({
      id: `PRD-${1000 + i}`,
      name: `Product ${i}`,
      category,
      price: (Math.random() * 500 + 10).toFixed(2),
      stock,
      status: stock > 10 ? "In Stock" : stock > 0 ? "Low Stock" : "Out of Stock",
      sales: Math.floor(Math.random() * 1000),
      rating: (Math.random() * 4 + 1).toFixed(1),
      image: `/placeholder.svg?height=80&width=80&query=product`,
    })
  }

  return products
}

const generateUserData = () => {
  const users = []
  const statuses = ["Active", "Inactive", "Pending"]
  const roles = ["Customer", "Admin", "Vendor", "Support"]

  for (let i = 1; i <= 50; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const role = roles[Math.floor(Math.random() * roles.length)]
    const registrationDate = subDays(new Date(), Math.floor(Math.random() * 365))

    users.push({
      id: `USR-${1000 + i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      status,
      role,
      orders: Math.floor(Math.random() * 20),
      spent: (Math.random() * 2000).toFixed(2),
      registrationDate: format(registrationDate, "MMM dd, yyyy"),
      lastLogin: format(subDays(new Date(), Math.floor(Math.random() * 30)), "MMM dd, yyyy"),
      avatar: `/placeholder.svg?height=40&width=40&query=person`,
    })
  }

  return users
}

const generateOrderData = () => {
  const orders = []
  const statuses = ["Completed", "Processing", "Shipped", "Cancelled", "Refunded"]
  const paymentMethods = ["Credit Card", "PayPal", "Bank Transfer", "Cash on Delivery"]

  for (let i = 1; i <= 50; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    const orderDate = subDays(new Date(), Math.floor(Math.random() * 30))

    orders.push({
      id: `ORD-${10000 + i}`,
      customer: `Customer ${i}`,
      date: format(orderDate, "MMM dd, yyyy"),
      amount: (Math.random() * 500 + 10).toFixed(2),
      status,
      paymentMethod,
      items: Math.floor(Math.random() * 10) + 1,
      shippingAddress: `Address ${i}, City, Country`,
      email: `customer${i}@example.com`,
    })
  }

  return orders
}

// Dashboard component
export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [activeSection, setActiveSection] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [profileImage, setProfileImage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState([new Date(subDays(new Date(), 30)), new Date()])
  const [startDate, endDate] = dateRange
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState({ field: "date", direction: "desc" })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filterOptions, setFilterOptions] = useState({
    status: "all",
    category: "all",
    priceRange: [0, 1000],
    dateRange: [subDays(new Date(), 30), new Date()],
  })

  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  // Sample data for charts
  const dailyData = generateDailyData()
  const productData = generateProductData()
  const userData = generateUserData()
  const orderData = generateOrderData()

  // User profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    location: "New York, USA",
    bio: "I'm a software developer with a passion for creating amazing user experiences.",
    occupation: "Software Developer",
    website: "https://example.com",
    joinDate: "January 2023",
    socialLinks: {
      twitter: "https://twitter.com/username",
      linkedin: "https://linkedin.com/in/username",
      github: "https://github.com/username",
    },
  })

  // Fetch user profile from server
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      try {
        const userData = await makeRequest(API_ENDPOINTS.GET_PROFILE)
        setUser(userData)

        // Update profile state with user data
        setProfile({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          birthday: userData.birthday || "",
          location: userData.location || "New York, USA",
          bio: "I'm a software developer with a passion for creating amazing user experiences.",
          occupation: userData.occupation || "Software Developer",
          website: "https://example.com",
          joinDate: userData.joinDate || "January 2023",
          socialLinks: {
            twitter: userData.socialLinks?.twitter || "https://twitter.com/username",
            linkedin: userData.socialLinks?.linkedin || "https://linkedin.com/in/username",
            github: userData.socialLinks?.github || "https://github.com/username",
          },
        })

        // Set profile image if available
        if (userData.profileImage) {
          setProfileImage(userData.profileImage)
        } else {
          setProfileImage("/diverse-group.png")
        }

        // Update localStorage
        localStorage.setItem("user", JSON.stringify(userData))
      } catch (error) {
        // If unauthorized, redirect to login
        if (error.message.includes("unauthorized") || error.message.includes("invalid token")) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          navigate("/login")
          return
        }
        throw error
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile data")
    }
  }

  useEffect(() => {
    fetchUserProfile()

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSocialLinkChange = (platform, value) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }))
  }

  const handleProfileImageClick = () => {
    fileInputRef.current.click()
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // Prepare profile data with optimized image
      const profileData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        birthday: profile.birthday,
        location: profile.location,
        bio: profile.bio,
        occupation: profile.occupation,
        website: profile.website,
        profileImage: profileImage,
        socialLinks: profile.socialLinks,
      }

      const data = await makeRequest(API_ENDPOINTS.UPDATE_PROFILE, {
        method: "PUT",
        body: JSON.stringify(profileData),
      })

      // Update user state and localStorage
      setUser(data.user)
      localStorage.setItem("user", JSON.stringify(data.user))

      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset form to current user data
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        birthday: user.birthday || "",
        location: user.location || "New York, USA",
        bio: "I'm a software developer with a passion for creating amazing user experiences.",
        occupation: user.occupation || "Software Developer",
        website: user.website || "https://example.com",
        joinDate: user.joinDate || "January 2023",
        socialLinks: {
          twitter: user.socialLinks?.twitter || "https://twitter.com/username",
          linkedin: user.socialLinks?.linkedin || "https://linkedin.com/in/username",
          github: user.socialLinks?.github || "https://github.com/username",
        },
      })

      // Reset profile image
      if (user.profileImage) {
        setProfileImage(user.profileImage)
      } else {
        setProfileImage("/diverse-group.png")
      }
    }

    setIsEditing(false)
  }

  // Chart data
  const revenueChartData = {
    labels: dailyData.map((item) => item.date),
    datasets: [
      {
        label: "Revenue",
        data: dailyData.map((item) => item.revenue),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const ordersChartData = {
    labels: dailyData.map((item) => item.date),
    datasets: [
      {
        label: "Orders",
        data: dailyData.map((item) => item.orders),
        backgroundColor: "#10b981",
        borderRadius: 6,
      },
    ],
  }

  const categoryChartData = {
    labels: ["Electronics", "Clothing", "Home & Kitchen", "Books", "Beauty", "Sports", "Toys"],
    datasets: [
      {
        data: [25, 20, 15, 12, 10, 10, 8],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"],
        borderWidth: 0,
      },
    ],
  }

  const customerChartData = {
    labels: ["New", "Returning", "Inactive"],
    datasets: [
      {
        data: [40, 45, 15],
        backgroundColor: ["#10b981", "#3b82f6", "#9ca3af"],
        borderWidth: 0,
      },
    ],
  }

  // Pagination logic
  const paginateData = (data, page, itemsPerPage) => {
    const startIndex = (page - 1) * itemsPerPage
    return data.slice(startIndex, startIndex + itemsPerPage)
  }

  // Filter and sort data
  const filterAndSortData = (data, filters, sort, search) => {
    let filteredData = [...data]

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase()
      filteredData = filteredData.filter((item) => {
        return Object.values(item).some(
          (value) => typeof value === "string" && value.toLowerCase().includes(searchLower),
        )
      })
    }

    // Apply filters
    if (filters.status !== "all") {
      filteredData = filteredData.filter((item) => item.status === filters.status)
    }

    if (filters.category !== "all") {
      filteredData = filteredData.filter((item) => item.category === filters.category)
    }

    // Apply sorting
    filteredData.sort((a, b) => {
      const aValue = a[sort.field]
      const bValue = b[sort.field]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sort.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sort.direction === "asc" ? aValue - bValue : bValue - aValue
    })

    return filteredData
  }

  // Get filtered and paginated data
  const getFilteredProducts = () => {
    const filtered = filterAndSortData(productData, filterOptions, sortBy, searchTerm)
    return paginateData(filtered, currentPage, itemsPerPage)
  }

  const getFilteredOrders = () => {
    const filtered = filterAndSortData(orderData, filterOptions, sortBy, searchTerm)
    return paginateData(filtered, currentPage, itemsPerPage)
  }

  const getFilteredUsers = () => {
    const filtered = filterAndSortData(userData, filterOptions, sortBy, searchTerm)
    return paginateData(filtered, currentPage, itemsPerPage)
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  // Handle sort change
  const handleSortChange = (field) => {
    setSortBy((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page on new search
  }

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilterOptions((prev) => ({
      ...prev,
      [key]: value,
    }))
    setCurrentPage(1) // Reset to first page on new filter
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <a href="#" className="sidebar-logo">
            <span className="sidebar-logo-icon">🚀</span>
            <span className="sidebar-logo-text">MERN Admin</span>
          </a>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Main</div>
            <ul className="sidebar-nav">
              <li className="sidebar-nav-item">
                <a
                  href="#"
                  className={`sidebar-nav-link ${activeTab === "dashboard" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("dashboard")
                    setActiveSection("overview")
                  }}
                >
                  <Home className="sidebar-nav-icon" />
                  <span className="sidebar-nav-text">Dashboard</span>
                </a>
              </li>
              <li className="sidebar-nav-item">
                <a
                  href="#"
                  className={`sidebar-nav-link ${activeTab === "users" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("users")
                    setActiveSection("list")
                  }}
                >
                  <Users className="sidebar-nav-icon" />
                  <span className="sidebar-nav-text">Users</span>
                </a>
              </li>
              <li className="sidebar-nav-item">
                <a
                  href="#"
                  className={`sidebar-nav-link ${activeTab === "products" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("products")
                    setActiveSection("list")
                  }}
                >
                  <Package className="sidebar-nav-icon" />
                  <span className="sidebar-nav-text">Products</span>
                </a>
              </li>
              <li className="sidebar-nav-item">
                <a
                  href="#"
                  className={`sidebar-nav-link ${activeTab === "orders" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("orders")
                    setActiveSection("list")
                  }}
                >
                  <ShoppingCart className="sidebar-nav-icon" />
                  <span className="sidebar-nav-text">Orders</span>
                </a>
              </li>
              <li className="sidebar-nav-item">
                <a
                  href="#"
                  className={`sidebar-nav-link ${activeTab === "analytics" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("analytics")
                    setActiveSection("sales")
                  }}
                >
                  <BarChart2 className="sidebar-nav-icon" />
                  <span className="sidebar-nav-text">Analytics</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Management</div>
            <ul className="sidebar-nav">
              <li className="sidebar-nav-item">
                <a
                  href="#"
                  className={`sidebar-nav-link ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="sidebar-nav-icon" />
                  <span className="sidebar-nav-text">Profile</span>
                </a>
              </li>
              <li className="sidebar-nav-item">
                <a
                  href="#"
                  className={`sidebar-nav-link ${activeTab === "marketing" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("marketing")
                    setActiveSection("campaigns")
                  }}
                >
                  <TrendingUp className="sidebar-nav-icon" />
                  <span className="sidebar-nav-text">Marketing</span>
                </a>
              </li>
              <li className="sidebar-nav-item">
                <a
                  href="#"
                  className={`sidebar-nav-link ${activeTab === "reports" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("reports")
                    setActiveSection("sales")
                  }}
                >
                  <FileText className="sidebar-nav-icon" />
                  <span className="sidebar-nav-text">Reports</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Settings</div>
            <ul className="sidebar-nav">
              <li className="sidebar-nav-item">
                <a
                  href="#"
                  className={`sidebar-nav-link ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("settings")
                    setActiveSection("general")
                  }}
                >
                  <Settings className="sidebar-nav-icon" />
                  <span className="sidebar-nav-text">General</span>
                </a>
              </li>
              <li className="sidebar-nav-item">
                <a href="#" className="sidebar-nav-link" onClick={handleLogout}>
                  <LogOut className="sidebar-nav-icon" />
                  <span className="sidebar-nav-text">Logout</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <button className="mobile-sidebar-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>

          <div className="header-search">
            <input
              type="text"
              className="header-search-input"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="header-search-icon" size={18} />
          </div>

          <div className="header-actions">
            <button className="header-action-button">
              <Bell size={20} />
              <span className="header-action-badge"></span>
            </button>
            <button className="header-action-button">
              <Mail size={20} />
            </button>
            <button className="header-action-button">
              <Calendar size={20} />
            </button>

            <div className="header-user">
              <div className="header-user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
              <div className="header-user-info">
                <div className="header-user-name">{user.name}</div>
                <div className="header-user-role">Administrator</div>
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <>
              <div className="dashboard-header">
                <h1 className="page-title">Dashboard</h1>
                <div className="dashboard-actions">
                  <div className="date-range-picker">
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        setDateRange(update)
                      }}
                      className="date-picker-input"
                    />
                    <Calendar className="date-picker-icon" size={18} />
                  </div>
                  <button className="btn btn-primary">
                    <Download size={16} />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="dashboard-grid">
                <div className="stats-card slide-in-up" style={{ animationDelay: "0.1s" }}>
                  <div className="stats-card-header">
                    <div className="stats-card-title">Total Revenue</div>
                    <div className="stats-card-icon primary">
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <div className="stats-card-value">$42,580</div>
                  <div className="stats-card-change positive">
                    <ArrowUpRight className="stats-card-change-icon" />
                    <span>12.5% from last month</span>
                  </div>
                </div>

                <div className="stats-card slide-in-up" style={{ animationDelay: "0.2s" }}>
                  <div className="stats-card-header">
                    <div className="stats-card-title">Total Orders</div>
                    <div className="stats-card-icon success">
                      <ShoppingBag size={20} />
                    </div>
                  </div>
                  <div className="stats-card-value">1,253</div>
                  <div className="stats-card-change positive">
                    <ArrowUpRight className="stats-card-change-icon" />
                    <span>8.2% from last month</span>
                  </div>
                </div>

                <div className="stats-card slide-in-up" style={{ animationDelay: "0.3s" }}>
                  <div className="stats-card-header">
                    <div className="stats-card-title">Total Customers</div>
                    <div className="stats-card-icon warning">
                      <Users size={20} />
                    </div>
                  </div>
                  <div className="stats-card-value">2,543</div>
                  <div className="stats-card-change negative">
                    <ArrowDownRight className="stats-card-change-icon" />
                    <span>3.1% from last month</span>
                  </div>
                </div>

                <div className="stats-card slide-in-up" style={{ animationDelay: "0.4s" }}>
                  <div className="stats-card-header">
                    <div className="stats-card-title">Conversion Rate</div>
                    <div className="stats-card-icon danger">
                      <Activity size={20} />
                    </div>
                  </div>
                  <div className="stats-card-value">3.24%</div>
                  <div className="stats-card-change positive">
                    <ArrowUpRight className="stats-card-change-icon" />
                    <span>1.2% from last month</span>
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className="chart-card slide-in-up" style={{ animationDelay: "0.5s" }}>
                  <div className="chart-card-header">
                    <div className="chart-card-title">Revenue Overview</div>
                    <div className="chart-card-actions">
                      <button className="chart-card-action">
                        <Filter size={16} />
                      </button>
                      <button className="chart-card-action">
                        <Download size={16} />
                      </button>
                      <button className="chart-card-action">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="chart-container">
                    <Line
                      data={revenueChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              drawBorder: false,
                            },
                          },
                          x: {
                            grid: {
                              display: false,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Orders Chart */}
                <div className="chart-card slide-in-up" style={{ animationDelay: "0.6s" }}>
                  <div className="chart-card-header">
                    <div className="chart-card-title">Orders Overview</div>
                    <div className="chart-card-actions">
                      <button className="chart-card-action">
                        <Filter size={16} />
                      </button>
                      <button className="chart-card-action">
                        <Download size={16} />
                      </button>
                      <button className="chart-card-action">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="chart-container">
                    <Bar
                      data={ordersChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              drawBorder: false,
                            },
                          },
                          x: {
                            grid: {
                              display: false,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="chart-card slide-in-up" style={{ animationDelay: "0.7s" }}>
                  <div className="chart-card-header">
                    <div className="chart-card-title">Sales by Category</div>
                    <div className="chart-card-actions">
                      <button className="chart-card-action">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="chart-container">
                    <Doughnut
                      data={categoryChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                          },
                        },
                        cutout: "70%",
                      }}
                    />
                  </div>
                </div>

                {/* Customer Distribution */}
                <div className="chart-card slide-in-up" style={{ animationDelay: "0.8s" }}>
                  <div className="chart-card-header">
                    <div className="chart-card-title">Customer Distribution</div>
                    <div className="chart-card-actions">
                      <button className="chart-card-action">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="chart-container">
                    <Pie
                      data={customerChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Recent Orders Table */}
                <div className="table-card slide-in-up" style={{ animationDelay: "0.9s" }}>
                  <div className="table-card-header">
                    <div className="table-card-title">Recent Orders</div>
                    <div className="table-card-actions">
                      <button className="table-card-action">
                        <Filter size={16} />
                        <span>Filter</span>
                      </button>
                      <button className="table-card-action">
                        <Download size={16} />
                        <span>Export</span>
                      </button>
                      <button className="table-card-action">
                        <Plus size={16} />
                        <span>Add Order</span>
                      </button>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderData.slice(0, 5).map((order) => (
                          <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.customer}</td>
                            <td>{order.date}</td>
                            <td>${order.amount}</td>
                            <td>
                              <span className={`table-status ${order.status.toLowerCase()}`}>{order.status}</span>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button className="table-action">
                                  <Eye size={16} />
                                </button>
                                <button className="table-action">
                                  <Edit size={16} />
                                </button>
                                <button className="table-action">
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="table-footer">
                    <button className="btn btn-secondary btn-sm">View All Orders</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="products-container slide-in-up">
              <div className="products-header">
                <h1 className="page-title">Products</h1>
                <div className="products-actions">
                  <div className="view-toggle">
                    <button
                      className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                      onClick={() => setViewMode("list")}
                    >
                      <List size={18} />
                    </button>
                  </div>
                  <button className="btn btn-primary">
                    <Plus size={16} />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              <div className="products-filters">
                <div className="filter-group">
                  <label>Category</label>
                  <select
                    value={filterOptions.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Books">Books</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Sports">Sports</option>
                    <option value="Toys">Toys</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Status</label>
                  <select
                    value={filterOptions.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <button className="btn btn-secondary filter-btn">
                  <SlidersHorizontal size={16} />
                  <span>More Filters</span>
                </button>
              </div>

              {viewMode === "grid" ? (
                <div className="products-grid">
                  {getFilteredProducts().map((product) => (
                    <div className="product-card" key={product.id}>
                      <div className="product-card-image">
                        <img src={product.image || "/placeholder.svg"} alt={product.name} />
                        <div className="product-card-badge">{product.status}</div>
                      </div>
                      <div className="product-card-content">
                        <h3 className="product-card-title">{product.name}</h3>
                        <div className="product-card-category">{product.category}</div>
                        <div className="product-card-price">${product.price}</div>
                        <div className="product-card-stock">Stock: {product.stock}</div>
                        <div className="product-card-rating">
                          <Star className="product-card-rating-icon" size={16} />
                          <span>{product.rating}</span>
                        </div>
                      </div>
                      <div className="product-card-actions">
                        <button className="product-card-action">
                          <Edit size={16} />
                        </button>
                        <button className="product-card-action">
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th onClick={() => handleSortChange("name")} className="sortable-header">
                          Name
                          {sortBy.field === "name" &&
                            (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                        </th>
                        <th onClick={() => handleSortChange("category")} className="sortable-header">
                          Category
                          {sortBy.field === "category" &&
                            (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                        </th>
                        <th onClick={() => handleSortChange("price")} className="sortable-header">
                          Price
                          {sortBy.field === "price" &&
                            (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                        </th>
                        <th onClick={() => handleSortChange("stock")} className="sortable-header">
                          Stock
                          {sortBy.field === "stock" &&
                            (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                        </th>
                        <th onClick={() => handleSortChange("status")} className="sortable-header">
                          Status
                          {sortBy.field === "status" &&
                            (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredProducts().map((product) => (
                        <tr key={product.id}>
                          <td>
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="product-table-image"
                            />
                          </td>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>${product.price}</td>
                          <td>{product.stock}</td>
                          <td>
                            <span className={`table-status ${product.status.toLowerCase().replace(/\s+/g, "-")}`}>
                              {product.status}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="table-action">
                                <Eye size={16} />
                              </button>
                              <button className="table-action">
                                <Edit size={16} />
                              </button>
                              <button className="table-action">
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <div className="pagination-info">
                  Page {currentPage} of {Math.ceil(productData.length / itemsPerPage)}
                </div>
                <button
                  className="pagination-btn"
                  disabled={currentPage === Math.ceil(productData.length / itemsPerPage)}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="orders-container slide-in-up">
              <div className="orders-header">
                <h1 className="page-title">Orders</h1>
                <div className="orders-actions">
                  <div className="date-range-picker">
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        setDateRange(update)
                      }}
                      className="date-picker-input"
                    />
                    <Calendar className="date-picker-icon" size={18} />
                  </div>
                  <button className="btn btn-primary">
                    <Plus size={16} />
                    <span>New Order</span>
                  </button>
                </div>
              </div>

              <div className="orders-filters">
                <div className="filter-group">
                  <label>Status</label>
                  <select
                    value={filterOptions.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Payment Method</label>
                  <select className="filter-select">
                    <option value="all">All Methods</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
                <button className="btn btn-secondary filter-btn">
                  <SlidersHorizontal size={16} />
                  <span>More Filters</span>
                </button>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSortChange("id")} className="sortable-header">
                        Order ID
                        {sortBy.field === "id" &&
                          (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </th>
                      <th onClick={() => handleSortChange("customer")} className="sortable-header">
                        Customer
                        {sortBy.field === "customer" &&
                          (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </th>
                      <th onClick={() => handleSortChange("date")} className="sortable-header">
                        Date
                        {sortBy.field === "date" &&
                          (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </th>
                      <th onClick={() => handleSortChange("amount")} className="sortable-header">
                        Amount
                        {sortBy.field === "amount" &&
                          (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </th>
                      <th onClick={() => handleSortChange("status")} className="sortable-header">
                        Status
                        {sortBy.field === "status" &&
                          (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredOrders().map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.date}</td>
                        <td>${order.amount}</td>
                        <td>
                          <span className={`table-status ${order.status.toLowerCase()}`}>{order.status}</span>
                        </td>
                        <td>{order.paymentMethod}</td>
                        <td>
                          <div className="table-actions">
                            <button className="table-action">
                              <Eye size={16} />
                            </button>
                            <button className="table-action">
                              <Edit size={16} />
                            </button>
                            <button className="table-action">
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <div className="pagination-info">
                  Page {currentPage} of {Math.ceil(orderData.length / itemsPerPage)}
                </div>
                <button
                  className="pagination-btn"
                  disabled={currentPage === Math.ceil(orderData.length / itemsPerPage)}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="users-container slide-in-up">
              <div className="users-header">
                <h1 className="page-title">Users</h1>
                <div className="users-actions">
                  <button className="btn btn-primary">
                    <UserPlus size={16} />
                    <span>Add User</span>
                  </button>
                </div>
              </div>

              <div className="users-filters">
                <div className="filter-group">
                  <label>Role</label>
                  <select className="filter-select">
                    <option value="all">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Customer">Customer</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Status</label>
                  <select
                    value={filterOptions.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <button className="btn btn-secondary filter-btn">
                  <SlidersHorizontal size={16} />
                  <span>More Filters</span>
                </button>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th onClick={() => handleSortChange("name")} className="sortable-header">
                        Name
                        {sortBy.field === "name" &&
                          (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </th>
                      <th onClick={() => handleSortChange("email")} className="sortable-header">
                        Email
                        {sortBy.field === "email" &&
                          (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </th>
                      <th onClick={() => handleSortChange("role")} className="sortable-header">
                        Role
                        {sortBy.field === "role" &&
                          (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </th>
                      <th onClick={() => handleSortChange("status")} className="sortable-header">
                        Status
                        {sortBy.field === "status" &&
                          (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </th>
                      <th onClick={() => handleSortChange("registrationDate")} className="sortable-header">
                        Joined
                        {sortBy.field === "registrationDate" &&
                          (sortBy.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredUsers().map((user) => (
                      <tr key={user.id}>
                        <td>
                          <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="user-avatar" />
                        </td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <span className={`table-status ${user.status.toLowerCase()}`}>{user.status}</span>
                        </td>
                        <td>{user.registrationDate}</td>
                        <td>
                          <div className="table-actions">
                            <button className="table-action">
                              <Eye size={16} />
                            </button>
                            <button className="table-action">
                              <Edit size={16} />
                            </button>
                            <button className="table-action">
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <div className="pagination-info">
                  Page {currentPage} of {Math.ceil(userData.length / itemsPerPage)}
                </div>
                <button
                  className="pagination-btn"
                  disabled={currentPage === Math.ceil(userData.length / itemsPerPage)}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="analytics-container slide-in-up">
              <div className="analytics-header">
                <h1 className="page-title">Analytics</h1>
                <div className="analytics-actions">
                  <div className="date-range-picker">
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        setDateRange(update)
                      }}
                      className="date-picker-input"
                    />
                    <Calendar className="date-picker-icon" size={18} />
                  </div>
                  <button className="btn btn-primary">
                    <Download size={16} />
                    <span>Export Report</span>
                  </button>
                </div>
              </div>

              <div className="analytics-tabs">
                <button
                  className={`analytics-tab ${activeSection === "sales" ? "active" : ""}`}
                  onClick={() => setActiveSection("sales")}
                >
                  <DollarSign size={18} />
                  <span>Sales</span>
                </button>
                <button
                  className={`analytics-tab ${activeSection === "customers" ? "active" : ""}`}
                  onClick={() => setActiveSection("customers")}
                >
                  <Users size={18} />
                  <span>Customers</span>
                </button>
                <button
                  className={`analytics-tab ${activeSection === "products" ? "active" : ""}`}
                  onClick={() => setActiveSection("products")}
                >
                  <Package size={18} />
                  <span>Products</span>
                </button>
                <button
                  className={`analytics-tab ${activeSection === "marketing" ? "active" : ""}`}
                  onClick={() => setActiveSection("marketing")}
                >
                  <TrendingUp size={18} />
                  <span>Marketing</span>
                </button>
              </div>

              {activeSection === "sales" && (
                <div className="analytics-content">
                  <div className="analytics-grid">
                    <div className="stats-card">
                      <div className="stats-card-header">
                        <div className="stats-card-title">Total Revenue</div>
                        <div className="stats-card-icon primary">
                          <DollarSign size={20} />
                        </div>
                      </div>
                      <div className="stats-card-value">$42,580</div>
                      <div className="stats-card-change positive">
                        <ArrowUpRight className="stats-card-change-icon" />
                        <span>12.5% from last month</span>
                      </div>
                    </div>

                    <div className="stats-card">
                      <div className="stats-card-header">
                        <div className="stats-card-title">Average Order Value</div>
                        <div className="stats-card-icon success">
                          <CreditCard size={20} />
                        </div>
                      </div>
                      <div className="stats-card-value">$128.50</div>
                      <div className="stats-card-change positive">
                        <ArrowUpRight className="stats-card-change-icon" />
                        <span>4.2% from last month</span>
                      </div>
                    </div>

                    <div className="stats-card">
                      <div className="stats-card-header">
                        <div className="stats-card-title">Conversion Rate</div>
                        <div className="stats-card-icon warning">
                          <Activity size={20} />
                        </div>
                      </div>
                      <div className="stats-card-value">3.24%</div>
                      <div className="stats-card-change negative">
                        <ArrowDownRight className="stats-card-change-icon" />
                        <span>0.5% from last month</span>
                      </div>
                    </div>

                    <div className="stats-card">
                      <div className="stats-card-header">
                        <div className="stats-card-title">Refund Rate</div>
                        <div className="stats-card-icon danger">
                          <RefreshCw size={20} />
                        </div>
                      </div>
                      <div className="stats-card-value">1.8%</div>
                      <div className="stats-card-change positive">
                        <ArrowUpRight className="stats-card-change-icon" />
                        <span>0.3% from last month</span>
                      </div>
                    </div>

                    <div className="chart-card" style={{ gridColumn: "span 2" }}>
                      <div className="chart-card-header">
                        <div className="chart-card-title">Revenue Trend</div>
                        <div className="chart-card-actions">
                          <button className="chart-card-action">
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="chart-container">
                        <Line
                          data={revenueChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "top",
                              },
                              title: {
                                display: false,
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                grid: {
                                  drawBorder: false,
                                },
                              },
                              x: {
                                grid: {
                                  display: false,
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>

                    <div className="chart-card" style={{ gridColumn: "span 2" }}>
                      <div className="chart-card-header">
                        <div className="chart-card-title">Sales by Category</div>
                        <div className="chart-card-actions">
                          <button className="chart-card-action">
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="chart-container">
                        <Doughnut
                          data={categoryChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "right",
                              },
                            },
                            cutout: "70%",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "customers" && (
                <div className="analytics-content">
                  <div className="analytics-grid">
                    <div className="stats-card">
                      <div className="stats-card-header">
                        <div className="stats-card-title">Total Customers</div>
                        <div className="stats-card-icon primary">
                          <Users size={20} />
                        </div>
                      </div>
                      <div className="stats-card-value">2,543</div>
                      <div className="stats-card-change positive">
                        <ArrowUpRight className="stats-card-change-icon" />
                        <span>8.7% from last month</span>
                      </div>
                    </div>

                    <div className="stats-card">
                      <div className="stats-card-header">
                        <div className="stats-card-title">New Customers</div>
                        <div className="stats-card-icon success">
                          <UserPlus size={20} />
                        </div>
                      </div>
                      <div className="stats-card-value">187</div>
                      <div className="stats-card-change positive">
                        <ArrowUpRight className="stats-card-change-icon" />
                        <span>12.3% from last month</span>
                      </div>
                    </div>

                    <div className="stats-card">
                      <div className="stats-card-header">
                        <div className="stats-card-title">Customer Retention</div>
                        <div className="stats-card-icon warning">
                          <RefreshCw size={20} />
                        </div>
                      </div>
                      <div className="stats-card-value">76.4%</div>
                      <div className="stats-card-change negative">
                        <ArrowDownRight className="stats-card-change-icon" />
                        <span>2.1% from last month</span>
                      </div>
                    </div>

                    <div className="stats-card">
                      <div className="stats-card-header">
                        <div className="stats-card-title">Avg. Lifetime Value</div>
                        <div className="stats-card-icon danger">
                          <DollarSign size={20} />
                        </div>
                      </div>
                      <div className="stats-card-value">$542</div>
                      <div className="stats-card-change positive">
                        <ArrowUpRight className="stats-card-change-icon" />
                        <span>5.8% from last month</span>
                      </div>
                    </div>

                    <div className="chart-card" style={{ gridColumn: "span 2" }}>
                      <div className="chart-card-header">
                        <div className="chart-card-title">Customer Growth</div>
                        <div className="chart-card-actions">
                          <button className="chart-card-action">
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="chart-container">
                        <Line
                          data={{
                            labels: dailyData.map((item) => item.date),
                            datasets: [
                              {
                                label: "New Customers",
                                data: dailyData.map(() => Math.floor(Math.random() * 20) + 5),
                                borderColor: "#10b981",
                                backgroundColor: "rgba(16, 185, 129, 0.1)",
                                fill: true,
                                tension: 0.4,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "top",
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                              },
                            },
                          }}
                        />
                      </div>
                    </div>

                    <div className="chart-card" style={{ gridColumn: "span 2" }}>
                      <div className="chart-card-header">
                        <div className="chart-card-title">Customer Distribution</div>
                        <div className="chart-card-actions">
                          <button className="chart-card-action">
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="chart-container">
                        <Pie
                          data={customerChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "right",
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="profile-container slide-in-up">
              <div className="profile-header">
                <h1 className="page-title">User Profile</h1>
                {!isEditing ? (
                  <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                    <Edit size={16} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="profile-actions">
                    <button className="btn btn-secondary" onClick={handleCancelEdit}>
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                    <button className="btn btn-success" onClick={handleSaveProfile} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="spinner"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-content">
                <div className="profile-sidebar">
                  <div className="profile-image-container">
                    <img src={profileImage || "/diverse-group.png"} alt="Profile" className="profile-image" />
                    {isEditing && (
                      <button className="profile-image-edit" onClick={handleProfileImageClick}>
                        <Camera size={20} />
                      </button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="profile-info-card">
                    <h3 className="profile-info-title">Profile Information</h3>
                    <ul className="profile-info-list">
                      <li className="profile-info-item">
                        <MapPin size={16} className="profile-info-icon" />
                        <span>{profile.location}</span>
                      </li>
                      <li className="profile-info-item">
                        <Briefcase size={16} className="profile-info-icon" />
                        <span>{profile.occupation}</span>
                      </li>
                      <li className="profile-info-item">
                        <Globe size={16} className="profile-info-icon" />
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="profile-info-link"
                        >
                          {profile.website.replace(/^https?:\/\//, "")}
                        </a>
                      </li>
                      <li className="profile-info-item">
                        <Clock size={16} className="profile-info-icon" />
                        <span>Joined {profile.joinDate}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="profile-info-card">
                    <h3 className="profile-info-title">Social Profiles</h3>
                    <ul className="profile-social-list">
                      <li className="profile-social-item">
                        <svg className="profile-social-icon twitter" viewBox="0 0 24 24" width="16" height="16">
                          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                        </svg>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile.socialLinks.twitter}
                            onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                            className="profile-social-input"
                          />
                        ) : (
                          <a
                            href={profile.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="profile-social-link"
                          >
                            Twitter
                          </a>
                        )}
                      </li>
                      <li className="profile-social-item">
                        <svg className="profile-social-icon linkedin" viewBox="0 0 24 24" width="16" height="16">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                          <rect x="2" y="9" width="4" height="12"></rect>
                          <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile.socialLinks.linkedin}
                            onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                            className="profile-social-input"
                          />
                        ) : (
                          <a
                            href={profile.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="profile-social-link"
                          >
                            LinkedIn
                          </a>
                        )}
                      </li>
                      <li className="profile-social-item">
                        <svg className="profile-social-icon github" viewBox="0 0 24 24" width="16" height="16">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 1.32c-.09 0-.19 0-.28-.01C13.27 1.01 12 2.23 12 2.23s-1.27-1.22-3.72-1.92c-.09 0-.19 0-.28.01-2.73-.67-3.91-.32-3.91-.32A5.07 5.07 0 0 0 4 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 8 18.13V22"></path>
                        </svg>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile.socialLinks.github}
                            onChange={(e) => handleSocialLinkChange("github", e.target.value)}
                            className="profile-social-input"
                          />
                        ) : (
                          <a
                            href={profile.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="profile-social-link"
                          >
                            GitHub
                          </a>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="profile-main">
                  <div className="profile-card">
                    <div className="profile-card-header">
                      <h2 className="profile-card-title">Personal Information</h2>
                    </div>
                    <div className="profile-card-body">
                      <div className="profile-form">
                        <div className="profile-form-row">
                          <div className="profile-form-group">
                            <label className="profile-form-label">
                              <User size={16} className="profile-form-icon" />
                              Full Name
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleProfileChange}
                                className="profile-form-input"
                                placeholder="Enter your full name"
                              />
                            ) : (
                              <div className="profile-form-value">{profile.name}</div>
                            )}
                          </div>

                          <div className="profile-form-group">
                            <label className="profile-form-label">
                              <AtSign size={16} className="profile-form-icon" />
                              Email Address
                            </label>
                            {isEditing ? (
                              <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                className="profile-form-input"
                                placeholder="Enter your email address"
                              />
                            ) : (
                              <div className="profile-form-value">{profile.email}</div>
                            )}
                          </div>
                        </div>

                        <div className="profile-form-row">
                          <div className="profile-form-group">
                            <label className="profile-form-label">
                              <Phone size={16} className="profile-form-icon" />
                              Phone Number
                            </label>
                            {isEditing ? (
                              <input
                                type="tel"
                                name="phone"
                                value={profile.phone}
                                onChange={handleProfileChange}
                                className="profile-form-input"
                                placeholder="Enter your phone number"
                              />
                            ) : (
                              <div className="profile-form-value">
                                {profile.phone || <span className="profile-form-placeholder">Not provided</span>}
                              </div>
                            )}
                          </div>

                          <div className="profile-form-group">
                            <label className="profile-form-label">
                              <Cake size={16} className="profile-form-icon" />
                              Birthday
                            </label>
                            {isEditing ? (
                              <input
                                type="date"
                                name="birthday"
                                value={profile.birthday}
                                onChange={handleProfileChange}
                                className="profile-form-input"
                              />
                            ) : (
                              <div className="profile-form-value">
                                {profile.birthday || <span className="profile-form-placeholder">Not provided</span>}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="profile-form-row">
                          <div className="profile-form-group full-width">
                            <label className="profile-form-label">
                              <MapPin size={16} className="profile-form-icon" />
                              Location
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                name="location"
                                value={profile.location}
                                onChange={handleProfileChange}
                                className="profile-form-input"
                                placeholder="Enter your location"
                              />
                            ) : (
                              <div className="profile-form-value">{profile.location}</div>
                            )}
                          </div>
                        </div>

                        <div className="profile-form-row">
                          <div className="profile-form-group full-width">
                            <label className="profile-form-label">
                              <MessageSquare size={16} className="profile-form-icon" />
                              Bio
                            </label>
                            {isEditing ? (
                              <textarea
                                name="bio"
                                value={profile.bio}
                                onChange={handleProfileChange}
                                className="profile-form-textarea"
                                placeholder="Tell us about yourself"
                                rows="4"
                              ></textarea>
                            ) : (
                              <div className="profile-form-value profile-bio">{profile.bio}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="profile-card">
                    <div className="profile-card-header">
                      <h2 className="profile-card-title">Account Information</h2>
                    </div>
                    <div className="profile-card-body">
                      <div className="profile-info-item">
                        <div className="profile-info-label">Account Status</div>
                        <div className="profile-info-value">
                          <span className="profile-badge success">
                            <CheckCircle size={14} />
                            Active
                          </span>
                        </div>
                      </div>
                      <div className="profile-info-item">
                        <div className="profile-info-label">Member Since</div>
                        <div className="profile-info-value">{profile.joinDate}</div>
                      </div>
                      <div className="profile-info-item">
                        <div className="profile-info-label">Last Login</div>
                        <div className="profile-info-value">Today at 12:45 PM</div>
                      </div>
                      <div className="profile-info-item">
                        <div className="profile-info-label">Two-Factor Authentication</div>
                        <div className="profile-info-value">
                          <span className="profile-badge warning">Not Enabled</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="profile-card">
                    <div className="profile-card-header">
                      <h2 className="profile-card-title">Recent Activity</h2>
                    </div>
                    <div className="profile-card-body">
                      <ul className="profile-activity-list">
                        <li className="profile-activity-item">
                          <div className="profile-activity-icon success">
                            <CheckCircle size={16} />
                          </div>
                          <div className="profile-activity-content">
                            <div className="profile-activity-title">Profile Updated</div>
                            <div className="profile-activity-time">2 hours ago</div>
                          </div>
                        </li>
                        <li className="profile-activity-item">
                          <div className="profile-activity-icon primary">
                            <LogIn size={16} />
                          </div>
                          <div className="profile-activity-content">
                            <div className="profile-activity-title">Logged In</div>
                            <div className="profile-activity-time">Today at 12:45 PM</div>
                          </div>
                        </li>
                        <li className="profile-activity-item">
                          <div className="profile-activity-icon warning">
                            <Settings size={16} />
                          </div>
                          <div className="profile-activity-content">
                            <div className="profile-activity-title">Settings Changed</div>
                            <div className="profile-activity-time">Yesterday at 3:30 PM</div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
