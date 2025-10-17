import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

interface PDFPreviewPageProps {
  invoiceId: string;
  onClose: () => void;
}

const PDFPreviewPage: React.FC<PDFPreviewPageProps> = ({ invoiceId, onClose }) => {
  const { token } = useAuth();
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceHtml = async () => {
      if (!token || !invoiceId) return;
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/invoices/${invoiceId}/html`, config);
        setHtmlContent(response.data.html);
      } catch (error) {
        alert('Failed to load invoice preview.');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchInvoiceHtml();
  }, [invoiceId, token, onClose]);
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
    } else {
        alert('Could not open print window. Please disable your pop-up blocker.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Invoice Preview</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {loading ? (
            <Spinner />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button type="button" onClick={onClose} className="mr-3 py-2 px-4 border border-gray-300 rounded-md text-sm">Close</button>
          <button type="button" onClick={handlePrint} className="py-2 px-4 bg-indigo-600 text-white rounded-md">
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewPage;