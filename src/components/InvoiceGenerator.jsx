import React from 'react';
import { useToast } from './Toast';
import { useTranslation } from './LanguageSelector';
import './InvoiceGenerator.css';

const Invoicegenerator = ({ order, user }) => {
    const { showToast } = useToast();
    const { t, lang } = useTranslation();

    const generateInvoice = () => {
        if (!order) {
            showToast(t.orderNotFound || 'Order data not found!', 'error');
            return;
        }

        const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice - Order #${order.id}</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'DM Sans', sans-serif;
            color: #1a1a2e;
            background: #f4f6fb;
            padding: 0;
        }

        .page {
            max-width: 820px;
            margin: 40px auto;
            background: #fff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(40,116,240,0.12);
        }

        /* ── TOP BAND ── */
        .invoice-header {
            background: linear-gradient(135deg, #2874f0 0%, #1a5dc7 60%, #0f3d8a 100%);
            padding: 36px 48px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative;
            overflow: hidden;
        }

        .invoice-header::before {
            content: '';
            position: absolute;
            top: -40px; right: -40px;
            width: 200px; height: 200px;
            border-radius: 50%;
            background: rgba(255,255,255,0.06);
        }

        .invoice-header::after {
            content: '';
            position: absolute;
            bottom: -60px; left: 30%;
            width: 280px; height: 280px;
            border-radius: 50%;
            background: rgba(255,255,255,0.04);
        }

        .logo-block .logo-text {
            font-size: 30px;
            font-weight: 700;
            color: #fff;
            letter-spacing: -0.5px;
        }

        .logo-block .logo-sub {
            font-size: 11px;
            color: rgba(255,255,255,0.65);
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-top: 2px;
        }

        .logo-block .company-address {
            margin-top: 14px;
            font-size: 12px;
            color: rgba(255,255,255,0.7);
            line-height: 1.7;
        }

        .invoice-meta { text-align: right; color: #fff; }

        .invoice-meta .tag {
            display: inline-block;
            background: rgba(255,255,255,0.18);
            border: 1px solid rgba(255,255,255,0.25);
            border-radius: 6px;
            padding: 4px 14px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 12px;
        }

        .invoice-meta h2 {
            font-size: 26px;
            font-weight: 700;
            margin-bottom: 6px;
        }

        .invoice-meta p {
            font-size: 12.5px;
            color: rgba(255,255,255,0.75);
            margin-bottom: 3px;
            font-family: 'DM Mono', monospace;
        }

        .status-pill {
            display: inline-block;
            margin-top: 12px;
            padding: 5px 14px;
            border-radius: 20px;
            background: #00e676;
            color: #003d1a;
            font-size: 12px;
            font-weight: 700;
        }

        /* ── BODY ── */
        .invoice-body { padding: 40px 48px; }

        /* Info Grid */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 36px;
        }

        .info-box {
            background: #f8faff;
            border: 1px solid #e4ecff;
            border-radius: 10px;
            padding: 20px 22px;
        }

        .info-box h3 {
            font-size: 10px;
            font-weight: 700;
            color: #2874f0;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e4ecff;
        }

        .info-box p {
            font-size: 13.5px;
            margin-bottom: 5px;
            color: #444;
            line-height: 1.5;
        }

        .info-box strong { color: #1a1a2e; font-weight: 600; }

        /* Table */
        .section-label {
            font-size: 11px;
            font-weight: 700;
            color: #2874f0;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 28px;
            font-size: 13.5px;
        }

        thead tr {
            background: #1a1a2e;
            color: #fff;
        }

        th {
            padding: 13px 16px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            letter-spacing: 0.5px;
        }

        th:last-child, td:last-child { text-align: right; }

        td {
            padding: 14px 16px;
            border-bottom: 1px solid #f0f0f8;
            color: #333;
            vertical-align: top;
        }

        td small { color: #888; font-size: 12px; display: block; margin-top: 2px; }

        tbody tr:hover { background: #fafbff; }

        /* Totals */
        .totals-wrap {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 36px;
        }

        .totals {
            width: 300px;
            background: #f8faff;
            border: 1px solid #e4ecff;
            border-radius: 10px;
            overflow: hidden;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 11px 20px;
            font-size: 13.5px;
            border-bottom: 1px solid #eef1f9;
            color: #555;
        }

        .total-row.free { color: #2e7d32; font-weight: 500; }

        .total-row.grand {
            background: #2874f0;
            color: #fff;
            font-size: 15px;
            font-weight: 700;
            border: none;
            padding: 14px 20px;
        }

        /* Thank You */
        .thank-you {
            text-align: center;
            padding: 28px 20px;
            background: linear-gradient(135deg, #f0f5ff, #e8f0fe);
            border-radius: 12px;
            border: 1px solid #c8d8ff;
            margin-bottom: 32px;
        }

        .thank-you .emoji { font-size: 32px; margin-bottom: 10px; }
        .thank-you h3 { font-size: 20px; font-weight: 700; color: #2874f0; margin-bottom: 6px; }
        .thank-you p { font-size: 13px; color: #666; }

        /* Footer */
        .invoice-footer {
            text-align: center;
            padding: 20px 48px 28px;
            border-top: 1px dashed #dde4f5;
            color: #aaa;
            font-size: 11.5px;
            line-height: 1.8;
        }

        .invoice-footer strong { color: #2874f0; }

        @media print {
            body { background: #fff; }
            .page { margin: 0; border-radius: 0; box-shadow: none; }
        }
    </style>
</head>
<body>
<div class="page">

    <!-- Header -->
    <div class="invoice-header">
        <div class="logo-block">
            <div class="logo-text">Flipkart</div>
            <div class="logo-sub">Explore Plus ✦</div>
            <div class="company-address">
                Flipkart Internet Pvt. Ltd.<br>
                Buildings Alyssa, Begonia & Clove<br>
                Embassy Tech Village, Bengaluru 560103
            </div>
        </div>
        <div class="invoice-meta">
            <div class="tag">Tax Invoice</div>
            <h2>INV-${order.id}-2026</h2>
            <p>Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p>Order #: ${order.id}</p>
            <p>TXN: TXN${order.id}${Date.now().toString().slice(-6)}</p>
            <div class="status-pill">✅ ${order.status || 'Confirmed'}</div>
        </div>
    </div>

    <!-- Body -->
    <div class="invoice-body">

        <!-- Info Grid -->
        <div class="info-grid">
            <div class="info-box">
                <h3>Bill To</h3>
                <p><strong>${user?.name || 'Customer'}</strong></p>
                <p>${order.address || 'N/A'}</p>
                <p>${order.city || ''} ${order.pincode ? '- ' + order.pincode : ''}</p>
                <p>📞 ${order.phone || 'N/A'}</p>
            </div>
            <div class="info-box">
                <h3>Payment Details</h3>
                <p><strong>Method:</strong> ${order.paymentMethod || 'Online'}</p>
                <p><strong>Status:</strong> Paid ✅</p>
                <p><strong>Order Date:</strong> ${order.orderedAt ?
                    new Date(order.orderedAt).toLocaleDateString('en-IN') :
                    new Date().toLocaleDateString('en-IN')}</p>
            </div>
        </div>

        <!-- Items Table -->
        <div class="section-label">Order Items</div>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>
                        <strong>Order Items</strong>
                        <small>Payment: ${order.paymentMethod || 'Online'}</small>
                    </td>
                    <td>1</td>
                    <td>₹${Number(order.totalAmount).toLocaleString('en-IN')}</td>
                    <td>₹${Number(order.totalAmount).toLocaleString('en-IN')}</td>
                </tr>
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-wrap">
            <div class="totals">
                <div class="total-row">
                    <span>Subtotal</span>
                    <span>₹${Number(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div class="total-row free">
                    <span>Delivery Charges</span>
                    <span>FREE 🚚</span>
                </div>
                <div class="total-row">
                    <span>GST (18%)</span>
                    <span>Included</span>
                </div>
                <div class="total-row grand">
                    <span>Grand Total</span>
                    <span>₹${Number(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>

        <!-- Thank You -->
        <div class="thank-you">
            <div class="emoji">🎉</div>
            <h3>Thank You for Shopping with Flipkart!</h3>
            <p>We appreciate your business. For queries, contact <strong>support@flipkart.com</strong></p>
        </div>

    </div>

    <!-- Footer -->
    <div class="invoice-footer">
        <p>This is a computer-generated invoice and does not require a physical signature.</p>
        <p>© 2026 <strong>Flipkart Clone</strong> · All rights reserved · GST No: 29AABCF0100N1ZJ</p>
    </div>

</div>
</body>
</html>`;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 600);

        showToast(t.invoiceReady || 'Invoice ready! 🧾', 'success');
    };

    return (
        <button
            className="invoice-btn"
            onClick={generateInvoice}
            title={t.downloadInvoice || 'Download Invoice'}>
            <span className="invoice-icon">🧾</span>
            <span className="invoice-label">{t.invoice || 'Invoice'}</span>
        </button>
    );
};

export default Invoicegenerator;

