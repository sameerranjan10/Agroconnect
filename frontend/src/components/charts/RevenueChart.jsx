import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

const MOCK_REVENUE = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 59000 },
  { month: 'Jun', revenue: 75000 },
]

export function RevenueChart({ data = MOCK_REVENUE, title = 'Revenue Overview' }) {
  return (
    <div className="glass-card p-6 h-full flex flex-col min-h-[350px]">
      <div className="mb-6">
        <h3 className="font-semibold text-stone-200">{title}</h3>
        <p className="text-xs text-stone-500 mt-1">Monthly performance</p>
      </div>
      
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2e25" vertical={false} />
            <XAxis dataKey="month" stroke="#78716c" tick={{ fill: '#78716c', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#78716c" tick={{ fill: '#78716c', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#162019', borderColor: '#1e2e25', borderRadius: '12px', color: '#f5f5f4' }}
              itemStyle={{ color: '#10b981' }}
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const MOCK_ORDER_STATUS = [
  { name: 'Delivered', value: 45, color: '#10b981' },
  { name: 'Shipped', value: 25, color: '#a855f7' },
  { name: 'Confirmed', value: 20, color: '#0ea5e9' },
  { name: 'Pending', value: 10, color: '#f59e0b' },
]

export function OrderStatusChart({ data = MOCK_ORDER_STATUS }) {
  return (
    <div className="glass-card p-6 h-full flex flex-col min-h-[350px]">
      <div className="mb-6">
        <h3 className="font-semibold text-stone-200">Orders by Status</h3>
      </div>
      
      <div className="flex-1 w-full min-h-[250px] relative flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#162019', borderColor: '#1e2e25', borderRadius: '12px', color: '#f5f5f4' }}
              itemStyle={{ color: '#f5f5f4' }}
              formatter={(value) => [`${value}%`, 'Orders']}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Custom Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-stone-400">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const MOCK_PRICES = [
  { month: 'Jan', rice: 32, wheat: 24, maize: 18 },
  { month: 'Feb', rice: 34, wheat: 25, maize: 19 },
  { month: 'Mar', rice: 33, wheat: 26, maize: 20 },
  { month: 'Apr', rice: 36, wheat: 27, maize: 22 },
  { month: 'May', rice: 38, wheat: 29, maize: 21 },
  { month: 'Jun', rice: 42, wheat: 30, maize: 24 },
]

export function PriceTrendChart({ data = MOCK_PRICES }) {
  return (
    <div className="glass-card p-6 h-full flex flex-col min-h-[400px]">
      <div className="mb-6">
        <h3 className="font-semibold text-stone-200">Market Price Trends</h3>
        <p className="text-xs text-stone-500 mt-1">Average wholesale prices (₹/kg)</p>
      </div>
      
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2e25" vertical={false} />
            <XAxis dataKey="month" stroke="#78716c" tick={{ fill: '#78716c', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#78716c" tick={{ fill: '#78716c', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#162019', borderColor: '#1e2e25', borderRadius: '12px', color: '#f5f5f4' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
            <Line type="monotone" dataKey="rice" name="Rice" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="wheat" name="Wheat" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="maize" name="Maize" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
