"use client"

import { useRef, useState, useMemo, useEffect } from "react"
import { useApi } from "../hooks/useApi"
import { apiService } from "../services/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Slider } from "./ui/slider"
import { Badge } from "./ui/badge"
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Search,
  Download,
  Settings,
  Eye,
  EyeOff,
  AlertTriangle,
  Shield,
  Activity,
  Network,
  TrendingUp,
  Filter,
  Maximize2,
  Info,
} from "lucide-react"
import { ForceGraph2D } from "react-force-graph"
import ErrorBoundary from "./ErrorBoundary"

const NetworkVisualization = () => {
  const fgRef = useRef()
  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showLabels, setShowLabels] = useState(true)
  const [showEdgeLabels, setShowEdgeLabels] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [nodeSize, setNodeSize] = useState(1)
  const [linkDistance, setLinkDistance] = useState(100)
  const [animationSpeed, setAnimationSpeed] = useState(1)

  const { data: networkData, loading, error } = useApi(apiService.getNetworkData)

  // Enhanced stats calculation
  const networkStats = useMemo(() => {
    if (!networkData) return { totalNodes: 0, totalEdges: 0, suspiciousNodes: 0, anomalousEdges: 0 }

    const nodes = Array.isArray(networkData.nodes) ? networkData.nodes : []
    const edges = Array.isArray(networkData.edges) ? networkData.edges : []

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      suspiciousNodes: nodes.filter((node) => node?.is_suspicious).length,
      anomalousEdges: edges.filter((edge) => edge?.is_anomaly).length,
      highRiskNodes: nodes.filter((node) => (node?.risk_score || 0) > 80).length,
      avgRiskScore:
        nodes.length > 0
          ? (nodes.reduce((sum, node) => sum + (node?.risk_score || 0), 0) / nodes.length).toFixed(1)
          : 0,
    }
  }, [networkData])

  // Enhanced graph data processing with search functionality
  const graphData = useMemo(() => {
    if (!networkData || typeof networkData !== "object") {
      return { nodes: [], edges: [] }
    }

    const nodes = Array.isArray(networkData.nodes)
      ? networkData.nodes.filter((node) => node && typeof node === "object" && node.id)
      : []

    const edges = Array.isArray(networkData.edges)
      ? networkData.edges.filter(
          (edge) => edge && typeof edge === "object" && (edge.source || edge.from) && (edge.target || edge.to),
        )
      : []

    return { nodes, edges }
  }, [networkData])

  // Enhanced filtering with search
  const filteredData = useMemo(() => {
    if (!graphData || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.edges)) {
      return { nodes: [], edges: [] }
    }

    const validNodes = graphData.nodes
      .filter((node) => node && typeof node === "object" && node.id)
      .map((node) => ({
        id: String(node.id || `node_${Math.random()}`),
        label: String(node.label || node.id || "Unknown"),
        type: String(node.type || "account"),
        balance: Number(node.balance) || 0,
        risk_score: Number(node.risk_score) || 0,
        is_suspicious: Boolean(node.is_suspicious),
        ...node,
      }))

    const validEdges = graphData.edges
      .filter((edge) => edge && typeof edge === "object" && (edge.source || edge.from) && (edge.target || edge.to))
      .map((edge) => ({
        source: String(edge.source || edge.source_id || edge.from || ""),
        target: String(edge.target || edge.target_id || edge.to || ""),
        width: Number(edge.width) || 1,
        is_anomaly: Boolean(edge.is_anomaly),
        anomaly_score: Number(edge.anomaly_score) || 0,
        transaction_type: String(edge.transaction_type || "unknown"),
        amount: Number(edge.amount) || 0,
        ...edge,
      }))
      .filter((edge) => edge.source && edge.target)

    // Apply search filter
    let searchFilteredNodes = validNodes
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      searchFilteredNodes = validNodes.filter(
        (node) =>
          (node.label || "").toLowerCase().includes(searchLower) ||
          (node.id || "").toLowerCase().includes(searchLower) ||
          (node.type || "").toLowerCase().includes(searchLower),
      )
    }

    // Apply category filters
    let filteredNodes = searchFilteredNodes
    let filteredEdges = validEdges

    if (filter === "suspicious") {
      filteredNodes = searchFilteredNodes.filter((node) => node.is_suspicious === true)
      filteredEdges = validEdges.filter((edge) => edge.is_anomaly === true)
    } else if (filter === "anomalies") {
      filteredNodes = searchFilteredNodes.filter((node) => (node.risk_score || 0) > 80)
      filteredEdges = validEdges.filter((edge) => edge.is_anomaly === true)
    } else if (filter === "high-value") {
      filteredNodes = searchFilteredNodes.filter((node) => (node.balance || 0) > 100000)
    }

    const finalNodes = filteredNodes.filter(
      (node) => node && node.id && typeof node.id === "string" && node.id.trim() !== "",
    )

    const finalEdges = filteredEdges.filter(
      (edge) =>
        edge &&
        edge.source &&
        edge.target &&
        typeof edge.source === "string" &&
        typeof edge.target === "string" &&
        edge.source.trim() !== "" &&
        edge.target.trim() !== "",
    )

    return { nodes: finalNodes, edges: finalEdges }
  }, [graphData, filter, searchTerm])

  const safeFilteredData = filteredData || { nodes: [], edges: [] }

  // Enhanced safe graph data with better styling
  const safeGraphData = useMemo(() => {
    try {
      const hasValidData = safeFilteredData.nodes.length > 0 || safeFilteredData.edges.length > 0

      if (!hasValidData || !safeFilteredData) {
        return { nodes: [], edges: [] }
      }

      const safeNodes = safeFilteredData.nodes
        .filter((node) => node && node.id && typeof node.id === "string" && node.id.trim() !== "")
        .map((node) => ({
          ...node,
          id: String(node.id).trim(),
          label: String(node.label || node.id || "Unknown").trim(),
          type: String(node.type || "account").trim(),
          // Enhanced node properties for better visualization
          val: Math.max(((node.balance || 0) / 10000) * nodeSize, 0.5),
          color: node.is_suspicious
            ? "#ef4444"
            : node.risk_score > 80
              ? "#f59e0b"
              : node.risk_score > 50
                ? "#10b981"
                : "#6366f1",
          fx: searchTerm && node.label.toLowerCase().includes(searchTerm.toLowerCase()) ? node.fx : undefined,
          fy: searchTerm && node.label.toLowerCase().includes(searchTerm.toLowerCase()) ? node.fy : undefined,
        }))

      const safeEdges = safeFilteredData.edges
        .filter(
          (edge) =>
            edge &&
            (edge.source || edge.from) &&
            (edge.target || edge.to) &&
            typeof (edge.source || edge.from) === "string" &&
            typeof (edge.target || edge.to) === "string" &&
            String(edge.source || edge.from).trim() !== "" &&
            String(edge.target || edge.to).trim() !== "",
        )
        .map((edge) => ({
          ...edge,
          source: String(edge.source || edge.from).trim(),
          target: String(edge.target || edge.to).trim(),
          // Enhanced edge properties
          width: Math.max((edge.width || 1) * 0.5, 0.5),
          color: edge.is_anomaly
            ? "#10b981"
            : edge.anomaly_score > 0.7
              ? "#f59e0b"
              : edge.anomaly_score > 0.4
                ? "#10b981"
                : "#6366f1",
          opacity: edge.is_anomaly ? 0.8 : 0.4,
          label: edge.transaction_type || `$${(edge.amount || 0).toLocaleString()}`,
        }))

      return { nodes: safeNodes, edges: safeEdges }
    } catch (error) {
      console.error("Error in safeGraphData:", error)
      return { nodes: [], edges: [] }
    }
  }, [safeFilteredData, nodeSize, searchTerm])

  const finalSafeGraphData = safeGraphData || { nodes: [], edges: [] }
  const hasValidData = finalSafeGraphData.nodes.length > 0 || finalSafeGraphData.edges.length > 0

  // Enhanced interaction handlers
  const handleNodeClick = (node) => {
    setSelectedNode(node)
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000)
      fgRef.current.zoom(Math.max(zoom * 1.2, 2), 1000)
    }
  }

  const handleZoomIn = () => {
    if (fgRef.current) {
      const newZoom = Math.min(zoom + 0.2, 3)
      setZoom(newZoom)
      fgRef.current.zoom(newZoom, 400)
    }
  }

  const handleZoomOut = () => {
    if (fgRef.current) {
      const newZoom = Math.max(zoom - 0.2, 0.3)
      setZoom(newZoom)
      fgRef.current.zoom(newZoom, 400)
    }
  }

  const handleReset = () => {
    if (fgRef.current) {
      setZoom(1)
      setFilter("all")
      setSearchTerm("")
      setSelectedNode(null)
      fgRef.current.zoomToFit(400, 50)
    }
  }

  const handleExport = () => {
    if (fgRef.current) {
      const canvas = fgRef.current.canvas()
      const link = document.createElement("a")
      link.download = `network-graph-${new Date().toISOString().split("T")[0]}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Auto-zoom to fit when data changes
  useEffect(() => {
    if (hasValidData && fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(1000, 100)
      }, 100)
    }
  }, [hasValidData, filter])

  if (loading) {
    return (
      <Card className="w-full border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <div
                className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto"
                style={{ animationDelay: "0.15s", animationDuration: "1.5s" }}
              ></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-800">Loading Network</h3>
              <p className="text-slate-600">Analyzing transaction relationships...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full border-0 shadow-lg bg-gradient-to-br from-white to-red-50">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-700">Error Loading Data</h3>
              <p className="text-red-600">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!networkData) {
    return (
      <Card className="w-full border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Network className="h-8 w-8 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-800">Waiting for Data</h3>
              <p className="text-slate-600">Network visualization will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-50 bg-white" : ""}`}>
      <Card className="w-full h-full border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Network className="h-4 w-4 text-white" />
                </div>
                Transaction Network Analysis
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Interactive visualization of transaction relationships and anomaly detection
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} className="rounded-full bg-transparent">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen} className="rounded-full bg-transparent">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
            <div className="bg-white rounded-lg p-3 border shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded">
                  <Network className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Total Nodes</div>
                  <div className="font-semibold text-sm text-slate-900">{networkStats.totalNodes}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-indigo-100 rounded">
                  <Activity className="h-3 w-3 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Connections</div>
                  <div className="font-semibold text-sm text-slate-900">{networkStats.totalEdges}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-red-100 rounded">
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Suspicious</div>
                  <div className="font-semibold text-sm text-slate-900">{networkStats.suspiciousNodes}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-orange-100 rounded">
                  <TrendingUp className="h-3 w-3 text-orange-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">High Risk</div>
                  <div className="font-semibold text-sm text-slate-900">{networkStats.highRiskNodes}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-yellow-100 rounded">
                  <Shield className="h-3 w-3 text-yellow-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Anomalies</div>
                  <div className="font-semibold text-sm text-slate-900">{networkStats.anomalousEdges}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Avg Risk</div>
                  <div className="font-semibold text-sm text-slate-900">{networkStats.avgRiskScore}%</div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Enhanced Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="font-medium rounded-full border-slate-200 hover:bg-white bg-transparent"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset View
              </Button>

              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-48 px-3 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40 rounded-full border-slate-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Nodes</SelectItem>
                  <SelectItem value="suspicious">Suspicious Only</SelectItem>
                  <SelectItem value="anomalies">High Risk</SelectItem>
                  <SelectItem value="high-value">High Value</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={showLabels ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowLabels(!showLabels)}
                  className="rounded-full"
                >
                  {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <span className="text-sm text-slate-600 font-medium">Labels</span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomOut} className="rounded-full bg-transparent">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Slider
                  value={[zoom]}
                  min={0.3}
                  max={3}
                  step={0.1}
                  onValueChange={([value]) => {
                    setZoom(value)
                    if (fgRef.current) {
                      fgRef.current.zoom(value, 200)
                    }
                  }}
                  className="w-20"
                />
                <Button variant="outline" size="sm" onClick={handleZoomIn} className="rounded-full bg-transparent">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("settings-panel").classList.toggle("hidden")}
                  className="rounded-full"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <div
                  id="settings-panel"
                  className="hidden absolute right-0 top-12 bg-white border rounded-lg shadow-lg p-4 w-64 z-10"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium block mb-1">Node Size</label>
                      <Slider
                        value={[nodeSize]}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={([value]) => setNodeSize(value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Link Distance</label>
                      <Slider
                        value={[linkDistance]}
                        min={50}
                        max={200}
                        step={10}
                        onValueChange={([value]) => setLinkDistance(value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graph Visualization */}
          {!hasValidData ? (
            <div className="flex items-center justify-center py-20 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border-2 border-dashed border-slate-200">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Network className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">No Data Available</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {filter === "all" ? "No network data to display" : "No nodes match the current filter"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border shadow-lg overflow-hidden"
              style={{ height: isFullscreen ? "calc(100vh - 250px)" : "600px" }}
            >
              <ErrorBoundary>
                {(() => {
                  try {
                    if (
                      !finalSafeGraphData ||
                      !Array.isArray(finalSafeGraphData.nodes) ||
                      !Array.isArray(finalSafeGraphData.edges)
                    ) {
                      return (
                        <div className="flex items-center justify-center h-full text-red-600">
                          Invalid graph data format
                        </div>
                      )
                    }

                    if (finalSafeGraphData.nodes.length === 0 && finalSafeGraphData.edges.length === 0) {
                      return (
                        <div className="flex items-center justify-center h-full">
                          No data available for visualization
                        </div>
                      )
                    }

                    const forceGraphData = {
                      nodes: finalSafeGraphData.nodes,
                      links: finalSafeGraphData.edges,
                    }

                    return (
                      <ErrorBoundary>
                        <ForceGraph2D
                          ref={fgRef}
                          graphData={forceGraphData}
                          width={isFullscreen ? window.innerWidth - 100 : 900}
                          height={isFullscreen ? window.innerHeight - 250 : 600}
                          backgroundColor="#1e293b"
                          // Enhanced node styling
                          nodeLabel={(node) => `
                            <div class="bg-white p-3 rounded-lg shadow-lg border max-w-xs">
                              <div class="font-semibold text-slate-900">${node.label}</div>
                              <div class="text-sm text-slate-600 mt-1">
                                <div>Type: ${node.type}</div>
                                <div>Balance: $${(node.balance || 0).toLocaleString()}</div>
                                <div>Risk Score: ${(node.risk_score || 0).toFixed(1)}%</div>
                                ${
                                  node.is_suspicious
                                    ? '<div class="text-red-600 font-medium">⚠️ Suspicious Activity</div>'
                                    : ""
                                }
                              </div>
                            </div>
                          `}
                          nodeColor={(node) => node.color || "#6366f1"}
                          nodeVal={(node) => node.val || 1}
                          nodeRelSize={6}
                          // Enhanced link styling
                          linkWidth={(link) => link.width || 1}
                          linkColor={(link) => link.color || "#6366f1"}
                          linkOpacity={(link) => link.opacity || 0.4}
                          linkLabel={showEdgeLabels ? (link) => link.label || "" : null}
                          linkDirectionalParticles={(link) => (link.is_anomaly ? 2 : 0)}
                          linkDirectionalParticleWidth={2}
                          linkDirectionalParticleColor={() => "#10b981"}
                          // Enhanced interactions
                          onNodeClick={handleNodeClick}
                          onNodeHover={setHoveredNode}
                          nodeCanvasObject={
                            showLabels
                              ? (node, ctx, globalScale) => {
                                  if (globalScale > 0.8) {
                                    const label = node.label || ""
                                    const fontSize = Math.max(10 / globalScale, 3)
                                    ctx.font = `${fontSize}px Sans-Serif`
                                    ctx.textAlign = "center"
                                    ctx.textBaseline = "top"
                                    ctx.fillStyle = "#FFFFFF"
                                    ctx.fillText(label, node.x, node.y + (node.val || 1) * 6)
                                  }
                                }
                              : null
                          }
                          // Physics settings
                          d3Force="link"
                          d3VelocityDecay={0.3}
                          linkDistance={linkDistance}
                          linkStrength={0.1}
                          enableNodeDrag={true}
                          enableZoomInteraction={true}
                          enablePanInteraction={true}
                          cooldownTime={15000}
                          cooldownTicks={100}
                        />
                      </ErrorBoundary>
                    )
                  } catch (error) {
                    console.error("Error rendering ForceGraph2D:", error)
                    return (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4 max-w-md">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">Visualization Error</h3>
                            <p className="text-sm text-slate-600 mt-1">{error.message}</p>
                          </div>
                        </div>
                      </div>
                    )
                  }
                })()}
              </ErrorBoundary>

              {/* Enhanced Legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg border shadow-lg p-4">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-slate-900">
                  <Info className="h-4 w-4" />
                  Legend
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#6366f1]"></div>
                    <span className="text-slate-700">
                      Normal ({networkStats.totalNodes - networkStats.suspiciousNodes - networkStats.highRiskNodes})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                    <span className="text-slate-700">Medium Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                    <span className="text-slate-700">High Risk ({networkStats.highRiskNodes})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                    <span className="text-slate-700">Suspicious ({networkStats.suspiciousNodes})</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-[#6366f1]"></div>
                      <span className="text-slate-700">Normal Transaction</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-4 h-0.5 bg-[#10b981]"></div>
                      <span className="text-slate-700">Anomalous ({networkStats.anomalousEdges})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Info Panel */}
              {hoveredNode && (
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg border shadow-lg p-4 min-w-64">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-slate-900">
                    <Activity className="h-4 w-4" />
                    {hoveredNode.label}
                    {hoveredNode.is_suspicious && (
                      <Badge variant="destructive" className="text-xs rounded-full">
                        Suspicious
                      </Badge>
                    )}
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Type:</span>
                      <span className="font-medium text-slate-900">{hoveredNode.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Balance:</span>
                      <span className="font-medium text-slate-900">${(hoveredNode.balance || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Risk Score:</span>
                      <span
                        className={`font-medium ${
                          hoveredNode.risk_score > 80
                            ? "text-orange-600"
                            : hoveredNode.risk_score > 50
                              ? "text-green-600"
                              : "text-blue-600"
                        }`}
                      >
                        {(hoveredNode.risk_score || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Connections:</span>
                      <span className="font-medium text-slate-900">
                        {
                          finalSafeGraphData.edges.filter(
                            (edge) => edge.source === hoveredNode.id || edge.target === hoveredNode.id,
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Selected Node Details */}
          {selectedNode && (
            <Card className="border-l-4 border-l-blue-500 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        selectedNode.is_suspicious
                          ? "bg-red-500"
                          : selectedNode.risk_score > 80
                            ? "bg-orange-500"
                            : selectedNode.risk_score > 50
                              ? "bg-green-500"
                              : "bg-blue-500"
                      }`}
                    ></div>
                    <span className="text-lg font-semibold text-slate-900">{selectedNode.label}</span>
                    <div className="flex gap-2">
                      {selectedNode.is_suspicious && (
                        <Badge variant="destructive" className="text-xs rounded-full">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Suspicious
                        </Badge>
                      )}
                      {selectedNode.risk_score > 80 && !selectedNode.is_suspicious && (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 rounded-full">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          High Risk
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-500 hover:text-slate-700 rounded-full"
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600 font-medium">Node Type</div>
                    <div className="font-semibold capitalize text-slate-900">{selectedNode.type || "Unknown"}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600 font-medium">Account Balance</div>
                    <div className="font-semibold text-green-600">${(selectedNode.balance || 0).toLocaleString()}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600 font-medium">Risk Score</div>
                    <div
                      className={`font-semibold ${
                        selectedNode.risk_score > 80
                          ? "text-orange-600"
                          : selectedNode.risk_score > 50
                            ? "text-green-600"
                            : "text-blue-600"
                      }`}
                    >
                      {(selectedNode.risk_score || 0).toFixed(1)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600 font-medium">Status</div>
                    <div
                      className={`font-semibold ${
                        selectedNode.is_suspicious
                          ? "text-red-600"
                          : selectedNode.risk_score > 80
                            ? "text-orange-600"
                            : selectedNode.risk_score > 50
                              ? "text-green-600"
                              : "text-blue-600"
                      }`}
                    >
                      {selectedNode.is_suspicious
                        ? "Suspicious"
                        : selectedNode.risk_score > 80
                          ? "High Risk"
                          : selectedNode.risk_score > 50
                            ? "Medium Risk"
                            : "Normal"}
                    </div>
                  </div>
                </div>

                {/* Connection Analysis */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-slate-900">
                    <Network className="h-4 w-4" />
                    Connection Analysis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                      <div className="text-blue-800 font-medium">Total Connections</div>
                      <div className="text-xl font-bold text-blue-900">
                        {
                          finalSafeGraphData.edges.filter(
                            (edge) => edge.source === selectedNode.id || edge.target === selectedNode.id,
                          ).length
                        }
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-lg border border-red-200">
                      <div className="text-red-800 font-medium">Anomalous Links</div>
                      <div className="text-xl font-bold text-red-900">
                        {
                          finalSafeGraphData.edges.filter(
                            (edge) =>
                              (edge.source === selectedNode.id || edge.target === selectedNode.id) && edge.is_anomaly,
                          ).length
                        }
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                      <div className="text-green-800 font-medium">Connected Nodes</div>
                      <div className="text-xl font-bold text-green-900">
                        {
                          new Set(
                            finalSafeGraphData.edges
                              .filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
                              .map((edge) => (edge.source === selectedNode.id ? edge.target : edge.source)),
                          ).size
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-slate-900">
                    <Activity className="h-4 w-4" />
                    Recent Transactions
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {finalSafeGraphData.edges
                      .filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
                      .slice(0, 5)
                      .map((edge, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${edge.is_anomaly ? "bg-green-500" : "bg-blue-500"}`}
                            ></div>
                            <span className="font-medium">
                              {edge.source === selectedNode.id ? `→ ${edge.target}` : `← ${edge.source}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">${(edge.amount || 0).toLocaleString()}</span>
                            {edge.is_anomaly && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 rounded-full">
                                Anomaly
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    {finalSafeGraphData.edges.filter(
                      (edge) => edge.source === selectedNode.id || edge.target === selectedNode.id,
                    ).length === 0 && (
                      <div className="text-center py-4 text-slate-500 text-sm">No transactions found</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-blue-700 font-medium">Network Density</div>
                  <div className="font-bold text-blue-900">
                    {networkStats.totalNodes > 0
                      ? (
                          (networkStats.totalEdges / (networkStats.totalNodes * (networkStats.totalNodes - 1))) *
                          100
                        ).toFixed(2)
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-red-700 font-medium">Threat Level</div>
                  <div className="font-bold text-red-900">
                    {networkStats.totalNodes > 0
                      ? ((networkStats.suspiciousNodes / networkStats.totalNodes) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-yellow-700 font-medium">Anomaly Rate</div>
                  <div className="font-bold text-yellow-900">
                    {networkStats.totalEdges > 0
                      ? ((networkStats.anomalousEdges / networkStats.totalEdges) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-green-700 font-medium">Health Score</div>
                  <div className="font-bold text-green-900">
                    {Math.max(0, Math.min(100, 100 - Number.parseFloat(networkStats.avgRiskScore))).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NetworkVisualization
