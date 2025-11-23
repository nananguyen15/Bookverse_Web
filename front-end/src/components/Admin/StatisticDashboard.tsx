import { useState, useEffect } from "react";
import {
  FaChartLine,
  FaShoppingCart,
  FaUsers,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
} from "react-icons/fa";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { orderApi, usersApi, booksApi } from "../../api";
import { ManagementLayout } from "../Shared/Management/ManagementLayout";
import { transformImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelpers";

interface StatisticData {
  // Actual Revenue (DELIVERED orders only)
  actualRevenue: number;
  actualOrders: number;
  actualAverageOrderValue: number;

  // Total (All orders including pending/processing)
  totalOrderValue: number;
  totalOrders: number;
  totalCustomers: number;

  // Pending Revenue (orders not yet delivered)
  pendingRevenue: number;
  pendingOrders: number;

  // Growth metrics
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;

  // Order status breakdown
  ordersByStatus: {
    status: string;
    count: number;
    value: number;
    percentage: number;
  }[];

  topProducts: {
    id: string;
    name: string;
    sales: number;
    quantity: number;
    revenue: number;
    imageUrl: string;
  }[];
  topCustomers: {
    id: string;
    name: string;
    orders: number;
    totalSpent: number;
    deliveredOrders: number;
  }[];
  salesByDay: {
    date: string;
    currentMonth: number;
    lastMonth: number;
  }[];
  ordersByDay: {
    date: string;
    count: number;
  }[];
}

export function StatisticDashboard() {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticData>({
    actualRevenue: 0,
    actualOrders: 0,
    actualAverageOrderValue: 0,
    totalOrderValue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingRevenue: 0,
    pendingOrders: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    ordersByStatus: [],
    topProducts: [],
    topCustomers: [],
    salesByDay: [],
    ordersByDay: [],
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      // Load data from API
      const [orders, allUsers, topSellingBooks] = await Promise.all([
        orderApi.getAllOrders(),
        usersApi.getAll(),
        booksApi.getTopSelling(),
      ]);

      const customers = allUsers.filter(
        (u) => !u.roles.includes("ADMIN") && !u.roles.includes("STAFF")
      );

      // Separate orders by status
      const deliveredOrders = orders.filter(o => o.status === "DELIVERED");
      const pendingOrders = orders.filter(o => o.status === "PENDING" || o.status === "PROCESSING");

      // Calculate actual revenue (from delivered orders only)
      const actualRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const actualOrders = deliveredOrders.length;
      const actualAverageOrderValue = actualOrders > 0 ? actualRevenue / actualOrders : 0;

      // Calculate total order value (all orders)
      const totalOrderValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Calculate pending revenue
      const pendingRevenue = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Calculate order status breakdown
      const statusMap: { [key: string]: { count: number; value: number } } = {};
      orders.forEach(order => {
        if (!statusMap[order.status]) {
          statusMap[order.status] = { count: 0, value: 0 };
        }
        statusMap[order.status].count++;
        statusMap[order.status].value += order.totalAmount;
      });

      const totalValue = Object.values(statusMap).reduce((sum, s) => sum + s.value, 0);
      const ordersByStatus = Object.entries(statusMap).map(([status, data]) => ({
        status,
        count: data.count,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      })).sort((a, b) => b.value - a.value);

      // Use top selling books from backend API and calculate revenue from orders
      interface ProductSale {
        id: string;
        name: string;
        sales: number;
        quantity: number;
        revenue: number;
        imageUrl: string;
      }

      // Map top selling books to product sales with revenue calculation
      const topProducts: ProductSale[] = topSellingBooks.slice(0, 10).map((book) => {
        let quantity = 0;
        let revenue = 0;

        // Calculate quantity and revenue from delivered orders
        orders.forEach((order) => {
          if (order.status === "DELIVERED") {
            order.orderItems?.forEach((item) => {
              if (item.bookId === book.id) {
                quantity += item.quantity;
                revenue += item.price * item.quantity;
              }
            });
          }
        });

        return {
          id: book.id.toString(),
          name: book.title,
          sales: quantity,
          quantity: quantity,
          revenue: revenue,
          imageUrl: book.image || "",
        };
      });

      console.log("Top Selling Products:", topProducts.map(p => ({
        name: p.name,
        quantity: p.quantity,
        revenue: p.revenue,
        imageUrl: p.imageUrl,
      })));

      // Calculate top customers (based on DELIVERED orders only)
      interface CustomerSpend {
        id: string;
        name: string;
        orders: number;
        totalSpent: number;
        deliveredOrders: number;
      }
      const customerSpend: { [key: string]: CustomerSpend } = {};

      // Count all orders
      orders.forEach((order) => {
        const customerId = order.userId.toString();
        const customer = customers.find((c) => c.id.toString() === customerId);
        if (customer) {
          if (!customerSpend[customerId]) {
            customerSpend[customerId] = {
              id: customerId,
              name: customer.name || customer.email,
              orders: 0,
              totalSpent: 0,
              deliveredOrders: 0,
            };
          }
          customerSpend[customerId].orders += 1;

          // Only count delivered orders for actual spending
          if (order.status === "DELIVERED") {
            customerSpend[customerId].totalSpent += order.totalAmount;
            customerSpend[customerId].deliveredOrders += 1;
          }
        }
      });

      const topCustomers = Object.values(customerSpend)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      // Calculate sales by day for current month (DELIVERED orders only)
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const salesByDay: { [key: string]: { current: number; last: number } } = {};

      // Initialize all days of current month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentMonth + 1}/${day}`;
        salesByDay[dateStr] = { current: 0, last: 0 };
      }

      // Aggregate sales by day (only DELIVERED orders)
      deliveredOrders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        const orderMonth = orderDate.getMonth();
        const orderYear = orderDate.getFullYear();
        const orderDay = orderDate.getDate();

        if (orderYear === currentYear && orderMonth === currentMonth) {
          const dateStr = `${orderMonth + 1}/${orderDay}`;
          if (salesByDay[dateStr]) {
            salesByDay[dateStr].current += order.totalAmount;
          }
        } else if (orderYear === lastMonthYear && orderMonth === lastMonth) {
          // Map to corresponding day in current month
          const dateStr = `${currentMonth + 1}/${orderDay}`;
          if (salesByDay[dateStr]) {
            salesByDay[dateStr].last += order.totalAmount;
          }
        }
      });

      const salesByDayArray = Object.entries(salesByDay).map(([date, sales]) => ({
        date,
        currentMonth: sales.current,
        lastMonth: sales.last,
      }));

      // Calculate orders by day for current month
      const ordersByDay: { [key: string]: number } = {};
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentMonth + 1}/${day}`;
        ordersByDay[dateStr] = 0;
      }

      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          const dateStr = `${currentMonth + 1}/${orderDate.getDate()}`;
          if (ordersByDay[dateStr] !== undefined) {
            ordersByDay[dateStr]++;
          }
        }
      });

      const ordersByDayArray = Object.entries(ordersByDay).map(([date, count]) => ({
        date,
        count,
      }));

      // Calculate growth percentages (comparing to last month - DELIVERED orders only)
      const currentMonthDelivered = deliveredOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const lastMonthDelivered = deliveredOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      });

      const currentMonthRevenue = currentMonthDelivered.reduce((sum, o) => sum + o.totalAmount, 0);
      const lastMonthRevenue = lastMonthDelivered.reduce((sum, o) => sum + o.totalAmount, 0);

      const revenueGrowth = lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

      const ordersGrowth = lastMonthDelivered.length > 0
        ? ((currentMonthDelivered.length - lastMonthDelivered.length) / lastMonthDelivered.length) * 100
        : 0;

      setStatistics({
        actualRevenue,
        actualOrders,
        actualAverageOrderValue,
        totalOrderValue,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        pendingRevenue,
        pendingOrders: pendingOrders.length,
        revenueGrowth,
        ordersGrowth,
        customersGrowth: 5.2, // Mock data
        ordersByStatus,
        topProducts,
        topCustomers,
        salesByDay: salesByDayArray,
        ordersByDay: ordersByDayArray,
      });
    } catch (error) {
      console.error("Failed to load statistics:", error);
      alert("Failed to load statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      statistics,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bookverse-report-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Sales Over Time Line Chart Options
  const salesOverTimeOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 350,
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ["#8B7355", "#D4B896"],
    series: [
      {
        name: "This Month",
        data: statistics.salesByDay.map((s) => s.currentMonth),
      },
      {
        name: "Last Month",
        data: statistics.salesByDay.map((s) => s.lastMonth),
      },
    ],
    xaxis: {
      categories: statistics.salesByDay.map((s) => s.date),
      labels: {
        style: {
          colors: "#6B5E4C",
          fontSize: "11px",
        },
        rotate: -45,
        rotateAlways: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B5E4C",
          fontSize: "12px",
        },
        formatter: (value) => `$${(value / 1000).toFixed(1)}k`,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    grid: {
      borderColor: "#F5F3F0",
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toLocaleString()}`,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      labels: {
        colors: "#6B5E4C",
      },
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
    },
  };

  // Orders Over Time Column Chart Options
  const ordersOverTimeOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
    },
    colors: ["#3B82F6"],
    series: [
      {
        name: "Orders",
        data: statistics.ordersByDay.map((s) => s.count),
      },
    ],
    xaxis: {
      categories: statistics.ordersByDay.map((s) => s.date),
      labels: {
        style: {
          colors: "#6B5E4C",
          fontSize: "10px",
        },
        rotate: -45,
        rotateAlways: true,
        hideOverlappingLabels: true,
        showDuplicates: false,
        trim: true,
      },
      tickAmount: 10,
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B5E4C",
          fontSize: "12px",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "60%",
      },
    },
    grid: {
      borderColor: "#F5F3F0",
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} orders`,
      },
      x: {
        formatter: (value, { dataPointIndex }) => {
          return statistics.ordersByDay[dataPointIndex]?.date || value.toString();
        },
      },
    },
  };

  // Order Status Breakdown Donut Chart Options
  const statusBreakdownOptions: ApexOptions = {
    chart: {
      type: "donut",
      height: 350,
      fontFamily: "Inter, sans-serif",
    },
    series: statistics.ordersByStatus.map((s) => s.value),
    labels: statistics.ordersByStatus.map((s) => s.status),
    colors: statistics.ordersByStatus.map((s) => {
      switch (s.status) {
        case "DELIVERED":
          return "#10B981"; // Green
        case "PENDING":
          return "#3B82F6"; // Blue
        case "PROCESSING":
          return "#F59E0B"; // Orange/Amber
        case "CANCELED":
          return "#EF4444"; // Red
        case "RETURNED":
          return "#8B5CF6"; // Purple
        default:
          return "#6B7280"; // Gray
      }
    }),
    legend: {
      position: "bottom",
      fontSize: "14px",
      labels: {
        colors: "#6B5E4C",
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              fontSize: "16px",
              color: "#6B5E4C",
            },
            value: {
              fontSize: "24px",
              fontWeight: 600,
              color: "#3D3229",
              formatter: (val) => `$${parseFloat(val).toLocaleString()}`,
            },
            total: {
              show: true,
              label: "Total Revenue",
              fontSize: "14px",
              color: "#6B5E4C",
              formatter: () => `$${statistics.totalOrderValue.toLocaleString()}`,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (value, { seriesIndex }) => {
          const status = statistics.ordersByStatus[seriesIndex];
          return `$${value.toLocaleString()} (${status?.count || 0} orders, ${status?.percentage.toFixed(1)}%)`;
        },
      },
    },
  };

  if (loading) {
    return (
      <ManagementLayout>
        <div className="space-y-6 p-6">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-beige-600">Loading statistics...</p>
          </div>
        </div>
      </ManagementLayout>
    );
  }

  return (
    <ManagementLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-beige-900">
              Statistics Dashboard
            </h2>
            <p className="text-beige-600 mt-1">Track your business performance</p>
          </div>

          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-6 py-3 bg-beige-700 text-white rounded-lg hover:bg-beige-800 transition-colors shadow-sm"
          >
            <FaDownload />
            <span className="font-medium">Export Report</span>
          </button>
        </div>

        {/* Row 1: Revenue Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Actual Revenue (DELIVERED) - Primary Metric */}
          <div className="bg-linear-to-br from-green-50 to-emerald-50 p-6 rounded-lg shadow-md border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-lg shadow-lg">
                <FaDollarSign className="text-white text-2xl" />
              </div>
              <span
                className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${statistics.revenueGrowth >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
              >
                {statistics.revenueGrowth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                {Math.abs(statistics.revenueGrowth).toFixed(1)}%
              </span>
            </div>
            <h3 className="text-green-700 text-sm font-semibold tracking-wide">Actual Revenue</h3>
            <p className="text-3xl font-bold text-green-900 mt-2">
              ${statistics.actualRevenue.toLocaleString()}
            </p>
            <p className="text-green-600 text-xs mt-2 font-medium">
              From {statistics.actualOrders} delivered orders
            </p>
            <p className="text-green-500 text-xs mt-1">
              Avg: ${statistics.actualAverageOrderValue.toFixed(2)}/order
            </p>
          </div>

          {/* Total Order Value (All orders) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaShoppingCart className="text-blue-600 text-2xl" />
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                All Orders
              </span>
            </div>
            <h3 className="text-beige-600 text-sm font-medium">Total Order Value</h3>
            <p className="text-3xl font-bold text-beige-900 mt-2">
              ${statistics.totalOrderValue.toLocaleString()}
            </p>
            <p className="text-beige-500 text-xs mt-2">
              {statistics.totalOrders} total orders
            </p>
            <p className="text-beige-400 text-xs mt-1">
              Includes pending & canceled
            </p>
          </div>

          {/* Pending Revenue */}
          <div className="bg-linear-to-br from-amber-50 to-yellow-50 p-6 rounded-lg shadow-sm border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <FaChartLine className="text-amber-600 text-2xl" />
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                Pending
              </span>
            </div>
            <h3 className="text-amber-700 text-sm font-medium">Pending Revenue</h3>
            <p className="text-3xl font-bold text-amber-900 mt-2">
              ${statistics.pendingRevenue.toLocaleString()}
            </p>
            <p className="text-amber-600 text-xs mt-2">
              {statistics.pendingOrders} orders in progress
            </p>
            <p className="text-amber-500 text-xs mt-1">
              {((statistics.pendingRevenue / statistics.totalOrderValue) * 100).toFixed(1)}% of total value
            </p>
          </div>

          {/* Total Customers */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaUsers className="text-purple-600 text-2xl" />
              </div>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${statistics.customersGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
              >
                {statistics.customersGrowth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                {Math.abs(statistics.customersGrowth).toFixed(1)}%
              </span>
            </div>
            <h3 className="text-beige-600 text-sm font-medium">
              Total Customers
            </h3>
            <p className="text-3xl font-bold text-beige-900 mt-2">
              {statistics.totalCustomers}
            </p>
            <p className="text-beige-500 text-xs mt-2">
              Registered users
            </p>
            <p className="text-beige-400 text-xs mt-1">
              {statistics.customersGrowth >= 0 ? "+" : ""}{statistics.customersGrowth.toFixed(1)}% vs last month
            </p>
          </div>
        </div>

        {/* Row 2: Main Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Over Time - Large Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-beige-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-beige-900">
                  Sales Over Time
                </h3>
                <p className="text-beige-600 text-sm mt-1">
                  Daily revenue comparison
                </p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statistics.revenueGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {statistics.revenueGrowth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                <span className="text-sm font-medium">
                  {statistics.revenueGrowth >= 0 ? '+' : ''}{statistics.revenueGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <ReactApexChart
              options={salesOverTimeOptions}
              series={salesOverTimeOptions.series}
              type="line"
              height={350}
            />
          </div>

          {/* Orders Over Time - Smaller Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-beige-900">
                Orders Over Time
              </h3>
              <p className="text-beige-600 text-sm mt-1">
                Daily order count
              </p>
            </div>
            <ReactApexChart
              options={ordersOverTimeOptions}
              series={ordersOverTimeOptions.series}
              type="bar"
              height={350}
            />
          </div>
        </div>

        {/* Row 3: Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status Breakdown Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-beige-900">
                Order Status
              </h3>
              <p className="text-beige-600 text-sm mt-1">
                Revenue by order status
              </p>
            </div>
            {statistics.ordersByStatus.length > 0 ? (
              <ReactApexChart
                options={statusBreakdownOptions}
                series={statusBreakdownOptions.series}
                type="donut"
                height={350}
              />
            ) : (
              <div className="flex items-center justify-center h-[350px] text-beige-400">
                No order data
              </div>
            )}
          </div>

          {/* Top Products Table */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-beige-900">
                Top Products
              </h3>
              <p className="text-beige-600 text-sm mt-1">
                Best selling products
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-beige-200">
                    <th className="text-left py-3 px-2 text-beige-700 font-semibold text-sm">
                      Image
                    </th>
                    <th className="text-left py-3 px-2 text-beige-700 font-semibold text-sm">
                      Product Name
                    </th>
                    <th className="text-right py-3 px-2 text-beige-700 font-semibold text-sm">
                      Revenue
                    </th>
                    <th className="text-right py-3 px-2 text-beige-700 font-semibold text-sm">
                      Sold
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.topProducts.slice(0, 10).map((product, index) => (
                    <tr
                      key={product.id}
                      className="border-b border-beige-100 hover:bg-beige-50 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div className="w-10 h-10 bg-beige-200 rounded-lg overflow-hidden border border-beige-300">
                          <img
                            src={transformImageUrl(product.imageUrl) || FALLBACK_IMAGES.book}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_IMAGES.book;
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="text-beige-900 font-medium text-sm">
                            {product.name}
                          </p>
                          <p className="text-beige-500 text-xs">
                            Rank #{index + 1}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <p className="text-beige-900 font-bold">
                          ${product.revenue.toLocaleString()}
                        </p>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <p className="text-beige-600 font-medium">
                          {product.quantity}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {statistics.topProducts.length === 0 && (
                <div className="text-center py-8 text-beige-500">
                  No product data available
                </div>
              )}
            </div>
          </div>

          {/* Top Customers Table */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-beige-900">
                Top Customers
              </h3>
              <p className="text-beige-600 text-sm mt-1">
                By actual spending (delivered orders)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-beige-200">
                    <th className="text-left py-3 px-4 text-beige-700 font-semibold text-sm">
                      Customer Name
                    </th>
                    <th className="text-right py-3 px-4 text-beige-700 font-semibold text-sm">
                      Total Revenue
                    </th>
                    <th className="text-right py-3 px-4 text-beige-700 font-semibold text-sm">
                      Orders
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.topCustomers.map((customer, index) => (
                    <tr
                      key={customer.id}
                      className="border-b border-beige-100 hover:bg-beige-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-beige-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-beige-900 font-medium">
                              {customer.name}
                            </p>
                            <p className="text-beige-500 text-xs">
                              Rank #{index + 1}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-green-700 font-bold">
                          ${customer.totalSpent.toLocaleString()}
                        </p>
                        <p className="text-beige-400 text-xs">
                          from delivered orders
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-beige-900 font-semibold">
                          {customer.deliveredOrders}
                        </p>
                        <p className="text-beige-400 text-xs">
                          of {customer.orders} total
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {statistics.topCustomers.length === 0 && (
                <div className="text-center py-8 text-beige-500">
                  No customer data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ManagementLayout>
  );
}
