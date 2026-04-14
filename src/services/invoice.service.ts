import { prisma } from "@/lib/prisma"




export const InvoiceService = {
    async createInvoice(invoiceId: string, amount: number, senderInvoiceNo: string, qrText: string, qpayShortUrl: string | null) {
        const exiting = await prisma.invoice.findUnique({
            where: { invoiceId: invoiceId }
        })

        if (exiting) return { error: 'Invoice аль хэдийн үүссэн байна.' }
        const newInvoice = await prisma.invoice.create({
            data: {
                invoiceId: invoiceId,
                senderInvoiceNo: senderInvoiceNo,
                qrText: qrText,
                amount: amount,
                qpayShortUrl: qpayShortUrl
            }
        });
        if (!newInvoice) return { error: "Invoice үүсгэхэд алдаа гарлаа" }
        return newInvoice
    }
}