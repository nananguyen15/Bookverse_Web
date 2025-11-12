import { useState, useEffect } from "react";
import { 
  FaChartLine, FaShoppingCart, FaUsers, FaDollarSign, 
  FaArrowUp, FaArrowDown, FaDownload 
} from "react-icons/fa";

interface StatisticData {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  salesGrowth: number;
  ordersGrowth: number;
  topProducts: {
    id: string;
    name: string;
    sales: number;
    quantity: number;
    revenue: number;
  }[];
  salesByMonth: {
    month: string;
    sales: number;
    orders: number;
  }[];
  ordersByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

export function StatisticDashboard() {
  const [statistics, setStatistics] = useState<StatisticData>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    salesGrowth: 0,
    ordersGrowth: 0,
    topProducts: [],
    salesByMonth: [],
    ordersByStatus: [],
  });

  const [timeRange, setTimeRange] = useState<"1W" | "1M" | "3M" | "6M" | "1Y">("1M");

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = () => {
    // Load data from localStorage
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const customers = users.filter((u: any) => u.role !== "admin" && u.role !== "staff");

    // Calculate total sales
    const totalSales = orders.reduce((sum: number, order: any) => 
      sum + (order.summary?.total || 0), 0
    );

    // Calculate average order value
    const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

    // Get top products
    const productSales: { [key: string]: any } = {};
    orders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        const key = item.id;
        if (!productSales[key]) {
          productSales[key] = {
            id: item.id,
            name: item.title,
            sales: 0,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += item.price * item.quantity;
        productSales[key].sales += item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate orders by status
    const statusCount: { [key: string]: number } = {};
    orders.forEach((order: any) => {
      const status = order.status || "Preparing";
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const ordersByStatus = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
      percentage: (count / orders.length) * 100 || 0,
    }));

    // Mock sales by month data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const salesByMonth = months.map((month, index) => ({
      month,
      sales: Math.floor(Math.random() * 50000) + 20000,
      orders: Math.floor(Math.random() * 500) + 200,
    }));

    setStatistics({
      totalSales,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      averageOrderValue,
      salesGrowth: 12.5,
      ordersGrowth: 8.3,
      topProducts,
      salesByMonth,
      ordersByStatus,
    });
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      statistics,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: "application/json" 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bookverse-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusColors: { [key: string]: string } = {
    Preparing: "bg-yellow-500",
    "Picked up": "bg-blue-500",
    Delivered: "bg-green-500",
    Cancelled: "bg-red-500",
    Confirmed: "bg-indigo-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-beige-900">Statistics Dashboard</h2>
          <p className="text-beige-600 mt-1">Track your business performance</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-beige-200">
            {(["1W", "1M", "3M", "6M", "1Y"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-beige-700 text-white"
                    : "text-beige-600 hover:text-beige-900"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-6 py-3 bg-beige-700 text-white rounded-lg hover:bg-beige-800 transition-colors shadow-sm"
          >
            <FaDownload />
            <span className="font-medium">Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaDollarSign className="text-green-600 text-2xl" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${
              statistics.salesGrowth >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {statistics.salesGrowth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(statistics.salesGrowth)}%
            </span>
          </div>
          <h3 className="text-beige-600 text-sm font-medium">Total Sales</h3>
          <p className="text-3xl font-bold text-beige-900 mt-2">
            ${statistics.totalSales.toLocaleString()}
          </p>
          <p className="text-beige-500 text-sm mt-2">+{statistics.salesGrowth}% vs last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaShoppingCart className="text-blue-600 text-2xl" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${
              statistics.ordersGrowth >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {statistics.ordersGrowth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(statistics.ordersGrowth)}%
            </span>
          </div>
          <h3 className="text-beige-600 text-sm font-medium">Total Orders</h3>
          <p className="text-3xl font-bold text-beige-900 mt-2">
            {statistics.totalOrders}
          </p>
          <p className="text-beige-500 text-sm mt-2">+{statistics.ordersGrowth}% vs last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaUsers className="text-purple-600 text-2xl" />
            </div>
          </div>
          <h3 className="text-beige-600 text-sm font-medium">Total Customers</h3>
          <p className="text-3xl font-bold text-beige-900 mt-2">
            {statistics.totalCustomers}
          </p>
          <p className="text-beige-500 text-sm mt-2">Active users</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaChartLine className="text-yellow-600 text-2xl" />
            </div>
          </div>
          <h3 className="text-beige-600 text-sm font-medium">Average Order Value</h3>
          <p className="text-3xl font-bold text-beige-900 mt-2">
            ${statistics.averageOrderValue.toFixed(2)}
          </p>
          <p className="text-beige-500 text-sm mt-2">Per order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
          <h3 className="text-xl font-bold text-beige-900 mb-6">Sales Revenue</h3>
          <div className="space-y-4">
            {statistics.salesByMonth.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-beige-600 text-sm font-medium">{data.month}</span>
                  <span className="text-beige-900 font-bold">${data.sales.toLocaleString()}</span>
                </div>
                <div className="w-full bg-beige-100 rounded-full h-3">
                  <div
                    className="bg-beige-700 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(data.sales / 70000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
          <h3 className="text-xl font-bold text-beige-900 mb-6">Orders by Status</h3>
          <div className="space-y-4">
            {statistics.ordersByStatus.map((status, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status.status] || "bg-gray-500"}`}></div>
                    <span className="text-beige-700 font-medium">{status.status}</span>
                  </div>
                  <span className="text-beige-900 font-bold">{status.count} ({status.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-beige-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${statusColors[status.status] || "bg-gray-500"}`}
                    style={{ width: `${status.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
        <h3 className="text-xl font-bold text-beige-900 mb-6">Top Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-beige-200">
                <th className="text-left py-3 px-4 text-beige-600 font-semibold">#</th>
                <th className="text-left py-3 px-4 text-beige-600 font-semibold">Product Name</th>
                <th className="text-right py-3 px-4 text-beige-600 font-semibold">Sales</th>
                <th className="text-right py-3 px-4 text-beige-600 font-semibold">Quantity</th>
                <th className="text-right py-3 px-4 text-beige-600 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {statistics.topProducts.length > 0 ? (
                statistics.topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-beige-100 hover:bg-beige-50 transition-colors">
                    <td className="py-4 px-4 text-beige-700">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-beige-200 text-beige-800 font-bold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-beige-900 font-medium">{product.name}</td>
                    <td className="py-4 px-4 text-right text-beige-700">{product.sales}</td>
                    <td className="py-4 px-4 text-right text-beige-700">{product.quantity}</td>
                    <td className="py-4 px-4 text-right text-beige-900 font-bold">
                      ${product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-beige-500">
                    No data available yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
