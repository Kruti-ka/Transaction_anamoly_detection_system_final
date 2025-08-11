import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import AnomalyList from '../components/AnomalyList';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AnomalyListPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [anomalies, setAnomalies] = useState([]);
  const limit = 10;

  const { data, loading, error } = useApi(() => apiService.getAnomalies(page, limit, statusFilter), [page, statusFilter]);

  useEffect(() => {
    if (data) {
      setAnomalies(data.anomalies);
    }
  }, [data]);

  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  if (loading) return <div className="text-center py-8">Loading anomalies...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error.message}</div>;

  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Anomaly List</CardTitle>
          <div className="flex items-center justify-between">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="false_positive">False Positive</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnomalyList
            anomalies={anomalies}
            selectedAnomaly={selectedAnomaly}
            setSelectedAnomaly={setSelectedAnomaly}
            setAnomalies={setAnomalies}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalyListPage;