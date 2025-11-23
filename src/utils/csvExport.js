export const downloadProductsAsCSV = (products, selectedDate) => {
  // Define CSV headers
//   const headers = [
//       'Order Number',
//       'Customer Number',
//       'Customer Name',
//     'Salesperson',
//     'Model Number',
//     'Description',
//     'Date',
//     'Quanity',
//     'Location',
//     'SerialNumber'
//   ];

//   // Convert products to CSV rows
//   const csvRows = products.map(product => [
//     product.OrderNumber,
//     product.CustomerNumber,
//     product.CustomerName,
//     product.Salesperson,
//     product.StockShipped,
//     `"${product.description}"`, // Wrap in quotes to handle commas
//     selectedDate,
//     product.QuantityToShip,
//     product.LocationNumber,
//     product.serialNumber.join(", ")
//   ]);

//   // Combine headers and rows
//   const csvContent = [
//     headers.join(','),
//     ...csvRows.map(row => row.join(','))
//   ].join('\n');

//   // Create and trigger download
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const link = document.createElement('a');

//   if (link.download !== undefined) {
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `products_${selectedDate}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }

// normalize input so we always have an array
  const list = Array.isArray(products) ? products : products ? [products] : [];

  if (list.length === 0) {
    console.warn("downloadProductsAsCSV: no products to export");
    return;
  }

//   const headers = Object.keys(list[0] || {});
//   const rows = list.map((p) =>
//     headers.map((h) => JSON.stringify(p[h] ?? "")).join(",")
//   );

//   Define CSV headers
  const headers = [
      'Order Number',
      'Customer Number',
      'Customer Name',
    'Salesperson',
    'Model Number',
    'Description',
    'Date',
    'Quanity',
    'Location',
    'SerialNumber'
  ];

  // Convert products to CSV rows
  const rows = products.map(product => [
    product.OrderNumber,
    product.CustomerNumber,
    `${product.CustomerName}`,
    product.Salesperson,
    product.StockShipped,
    `"${product.Description1}"`, // Wrap in quotes to handle commas
    selectedDate,
    product.QuantityToShip,
    product.LocationNumber,
    product.SerialNumber.join(", ")
  ]);

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};