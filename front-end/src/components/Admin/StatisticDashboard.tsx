import { useState, useEffect } from "react";
import {
  FaChartLine,
  FaShoppingCart,
  FaUsers,
  FaDollarSign,
  FaBoxOpen,
  FaDownload,
} from "react-icons/fa";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { statisticsApi } from "../../api";
import type { TopCustomerStats, TopBookStats, SalesDataPoint, OrderStatusStats } from "../../api";
import { ManagementLayout } from "../Shared/Management/ManagementLayout";
import { transformImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelpers";

interface StatisticData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  topCustomers: TopCustomerStats[];
  topBooks: TopBookStats[];
  salesOverTime: SalesDataPoint[];
  ordersOverTime: SalesDataPoint[];
  orderStatus: OrderStatusStats;
}

export function StatisticDashboard() {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    topCustomers: [],
    topBooks: [],
    salesOverTime: [],
    ordersOverTime: [],
    orderStatus: {
      pending: 0,
      confirmed: 0,
      processing: 0,
      delivering: 0,
      delivered: 0,
      cancelled: 0,
    },
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      // Load all statistics data from API
      const [
        totalRevenue,
        totalOrders,
        totalCustomers,
        topCustomers,
        topBooks,
        salesOverTime,
        ordersOverTime,
        orderStatus,
      ] = await Promise.all([
        statisticsApi.getTotalRevenue(),
        statisticsApi.getTotalOrders(),
        statisticsApi.getTotalCustomers(),
        statisticsApi.getTop5Customers(),
        statisticsApi.getTop5Books(),
        statisticsApi.getSalesOverTime(),
        statisticsApi.getOrdersOverTime(),
        statisticsApi.getOrdersStatus(),
      ]);

      setStatistics({
        totalRevenue,
        totalOrders,
        totalCustomers,
        topCustomers,
        topBooks,
        salesOverTime,
        ordersOverTime,
        orderStatus,
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
    link.download = `bookverse-statistics-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calculate total orders from status breakdown
  const totalOrdersFromStatus = Object.values(statistics.orderStatus).reduce((sum, count) => sum + count, 0);

  // Sales Over Time Line Chart - Beige/Brown Theme
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
    colors: ["#74512D", "#D4A574"], // Brown shades
    series: [
      {
        name: "Daily Sales",
        data: statistics.salesOverTime.map((s) => s.totalSales),
      },
    ],
    xaxis: {
      categories: statistics.salesOverTime.map((s) => s.date),
      labels: {
        style: {
          colors: "#74512D",
          fontSize: "11px",
        },
        rotate: -45,
        rotateAlways: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#74512D",
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
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      },
    },
  };

  // Orders Over Time Column Chart - Beige/Brown Theme
  const ordersOverTimeOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
    },
    colors: ["#8B7355"],
    series: [
      {
        name: "Orders",
        data: statistics.ordersOverTime.map((s) => s.totalSales), // Backend uses totalSales for order count
      },
    ],
    xaxis: {
      categories: statistics.ordersOverTime.map((s) => s.date),
      labels: {
        style: {
          colors: "#74512D",
          fontSize: "10px",
        },
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#74512D",
          fontSize: "12px",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "65%",
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
    },
  };

  // Order Status Breakdown Donut Chart - Beige/Brown Theme
  const statusBreakdownOptions: ApexOptions = {
    chart: {
      type: "donut",
      height: 380,
      fontFamily: "Inter, sans-serif",
    },
    series: [
      statistics.orderStatus.pending,
      statistics.orderStatus.confirmed,
      statistics.orderStatus.processing,
      statistics.orderStatus.delivering,
      statistics.orderStatus.delivered,
      statistics.orderStatus.cancelled,
    ],
    labels: ["Pending", "Confirmed", "Processing", "Delivering", "Delivered", "Cancelled"],
    colors: ["#F59E0B", "#3B82F6", "#8B7355", "#A78BFA", "#10B981", "#EF4444"],
    legend: {
      position: "bottom",
      fontSize: "13px",
      fontFamily: "Inter, sans-serif",
      labels: {
        colors: "#74512D",
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              fontSize: "15px",
              color: "#74512D",
              fontFamily: "BelgianoSerif2, serif",
            },
            value: {
              fontSize: "28px",
              fontWeight: 700,
              color: "#422100",
              fontFamily: "Inter, sans-serif",
              formatter: (val) => val.toString(),
            },
            total: {
              show: true,
              label: "Total Orders",
              fontSize: "14px",
              color: "#74512D",
              fontFamily: "Inter, sans-serif",
              formatter: () => totalOrdersFromStatus.toString(),
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
        formatter: (value) => `${value} orders`,
      },
    },
  };

  if (loading) {
    return (
      <ManagementLayout>
        <div className="space-y-6 p-6">
          <div className="bg-gradient-to-br from-beige-50 to-white rounded-lg shadow-sm p-12 text-center border border-beige-200">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-beige-700 mb-4"></div>
            <p className="text-beige-700 font-medium">Loading statistics...</p>
          </div>
        </div>
      </ManagementLayout>
    );
  }

  const averageOrderValue = statistics.totalOrders > 0 ? statistics.totalRevenue / statistics.totalOrders : 0;

  return (
    <ManagementLayout>
      <div className="space-y-6 p-6 bg-beige-50/30">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-beige-900" style={{ fontFamily: "BelgianoSerif2, serif" }}>
              Statistics Dashboard
            </h1>
            <p className="text-beige-600 mt-2 text-lg">Track your business performance and insights</p>
          </div>

          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-6 py-3 bg-beige-700 text-white rounded-lg hover:bg-beige-800 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <FaDownload />
            <span>Export Report</span>
          </button>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-white to-beige-50 p-6 rounded-xl shadow-md border-2 border-beige-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-beige-700 rounded-lg shadow-lg">
                <FaDollarSign className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-beige-700 text-sm font-bold tracking-wide uppercase">Total Revenue</h3>
            <p className="text-4xl font-bold text-beige-900 mt-2">
              ${statistics.totalRevenue.toLocaleString()}
            </p>
            <p className="text-beige-600 text-sm mt-3 font-medium">
              From delivered orders
            </p>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md border-2 border-blue-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600 rounded-lg shadow-lg">
                <FaShoppingCart className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-blue-700 text-sm font-bold tracking-wide uppercase">Total Orders</h3>
            <p className="text-4xl font-bold text-blue-900 mt-2">
              {statistics.totalOrders.toLocaleString()}
            </p>
            <p className="text-blue-600 text-sm mt-3 font-medium">
              Avg: ${averageOrderValue.toFixed(2)}/order
            </p>
          </div>

          {/* Total Customers */}
          <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl shadow-md border-2 border-purple-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600 rounded-lg shadow-lg">
                <FaUsers className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-purple-700 text-sm font-bold tracking-wide uppercase">Total Customers</h3>
            <p className="text-4xl font-bold text-purple-900 mt-2">
              {statistics.totalCustomers.toLocaleString()}
            </p>
            <p className="text-purple-600 text-sm mt-3 font-medium">
              Registered users
            </p>
          </div>

          {/* Top Products Sold */}
          <div className="bg-gradient-to-br from-white to-amber-50 p-6 rounded-xl shadow-md border-2 border-amber-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-600 rounded-lg shadow-lg">
                <FaBoxOpen className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-amber-700 text-sm font-bold tracking-wide uppercase">Top Products</h3>
            <p className="text-4xl font-bold text-amber-900 mt-2">
              {statistics.topBooks.length}
            </p>
            <p className="text-amber-600 text-sm mt-3 font-medium">
              Best selling books
            </p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Over Time */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-beige-200">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-beige-900" style={{ fontFamily: "BelgianoSerif2, serif" }}>
                Sales Over Time
              </h3>
              <p className="text-beige-600 text-sm mt-1">Daily revenue trends</p>
            </div>
            {statistics.salesOverTime.length > 0 ? (
              <ReactApexChart
                options={salesOverTimeOptions}
                series={salesOverTimeOptions.series}
                type="line"
                height={350}
              />
            ) : (
              <div className="flex items-center justify-center h-[350px] text-beige-400">
                No sales data available
              </div>
            )}
          </div>

          {/* Orders Over Time */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-beige-200">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-beige-900" style={{ fontFamily: "BelgianoSerif2, serif" }}>
                Orders Over Time
              </h3>
              <p className="text-beige-600 text-sm mt-1">Daily order volume</p>
            </div>
            {statistics.ordersOverTime.length > 0 ? (
              <ReactApexChart
                options={ordersOverTimeOptions}
                series={ordersOverTimeOptions.series}
                type="bar"
                height={350}
              />
            ) : (
              <div className="flex items-center justify-center h-[350px] text-beige-400">
                No order data available
              </div>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-beige-200">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-beige-900" style={{ fontFamily: "BelgianoSerif2, serif" }}>
                Order Status
              </h3>
              <p className="text-beige-600 text-sm mt-1">Distribution by status</p>
            </div>
            {totalOrdersFromStatus > 0 ? (
              <ReactApexChart
                options={statusBreakdownOptions}
                series={statusBreakdownOptions.series}
                type="donut"
                height={380}
              />
            ) : (
              <div className="flex items-center justify-center h-[380px] text-beige-400">
                No status data available
              </div>
            )}
          </div>

          {/* Top Books Table */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-beige-200">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-beige-900" style={{ fontFamily: "BelgianoSerif2, serif" }}>
                Top 5 Books
              </h3>
              <p className="text-beige-600 text-sm mt-1">Best selling products</p>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto">
              {statistics.topBooks.length > 0 ? (
                statistics.topBooks.map((book, index) => (
                  <div
                    key={book.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-beige-50 border border-beige-200 hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-beige-200 rounded-lg overflow-hidden border-2 border-beige-300">
                      <img
                        src={transformImageUrl(book.image) || FALLBACK_IMAGES.book}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGES.book;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-beige-900 font-semibold text-sm truncate">{book.title}</p>
                      <p className="text-beige-600 text-xs">Rank #{index + 1}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-beige-900 font-bold text-lg">{book.totalSold}</p>
                      <p className="text-beige-500 text-xs">sold</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-beige-400">
                  No book data available
                </div>
              )}
            </div>
          </div>

          {/* Top Customers Table */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-beige-200">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-beige-900" style={{ fontFamily: "BelgianoSerif2, serif" }}>
                Top 5 Customers
              </h3>
              <p className="text-beige-600 text-sm mt-1">By total spending</p>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto">
              {statistics.topCustomers.length > 0 ? (
                statistics.topCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-beige-50 border border-beige-200 hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0">
                      {customer.image ? (
                        <img
                          src={transformImageUrl(customer.image)}
                          alt={customer.name}
                          className="w-12 h-12 rounded-full border-2 border-beige-300 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMAGES.user;
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-beige-700 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-beige-600">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-beige-900 font-semibold text-sm truncate">{customer.name}</p>
                      <p className="text-beige-600 text-xs">Rank #{index + 1}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-green-700 font-bold text-sm">
                        ${customer.totalSpent.toLocaleString()}
                      </p>
                      <p className="text-beige-500 text-xs">spent</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-beige-400">
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
