
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export const getRiskLevel = (score) => {
  if (score >= 81) return { level: 'Critical', color: 'text-red-600' };
  if (score >= 61) return { level: 'High', color: 'text-orange-600' };
  if (score >= 31) return { level: 'Medium', color: 'text-yellow-600' };
  return { level: 'Low', color: 'text-green-600' };
};