'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2, X, IndianRupee, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { deleteStudent } from '@/app/actions'

interface DeleteStudentDialogProps {
  isOpen: boolean
  onClose: () => void
  student: {
    id: string
    name: string
    seat_number?: string
    payment_status?: string
    total_fee?: number
    amount_paid?: number
    discount_amount?: number
  } | null
}

export default function DeleteStudentDialog({ isOpen, onClose, student }: DeleteStudentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [wantRefund, setWantRefund] = useState(false)
  const [refundAmount, setRefundAmount] = useState(0)
  const router = useRouter()

  if (!isOpen || !student) return null

  const totalFee = Number(student.total_fee || 0)
  const amountPaid = Number(student.amount_paid || 0)
  const discountAmt = Number(student.discount_amount || 0)
  const paymentStatus = student.payment_status || 'pending'

  // Calculate what they actually paid
  const actualPaid = paymentStatus === 'paid' ? totalFee
    : paymentStatus === 'discounted' ? (totalFee - discountAmt)
    : paymentStatus === 'partial' ? amountPaid
    : 0

  const isPending = paymentStatus === 'pending'

  const handleDelete = async () => {
    setLoading(true)
    try {
      const refundData = wantRefund && refundAmount > 0
        ? { refundAmount, note: `Refund of ₹${refundAmount}. Student removed from seat ${student.seat_number || ''}` }
        : { refundAmount: 0, note: `No refund given. Student removed.` }

      const res = await deleteStudent(student.id, student.name, refundData)
      if (!res.success) throw new Error(res.error)

      router.refresh()
      onClose()
      // Reset state
      setWantRefund(false)
      setRefundAmount(0)
    } catch (err: any) {
      alert('Error deleting student: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8 space-y-5">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-brand-900 leading-tight">Remove Student?</h3>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-bold text-gray-900">{student.name}</span> · Seat <span className="font-bold text-brand-600">{student.seat_number}</span>
              </p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Payment Summary</p>
            
            {paymentStatus === 'paid' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Full Payment</span>
                <span className="text-sm font-black text-green-600 font-mono">₹{totalFee.toLocaleString('en-IN')}</span>
              </div>
            )}

            {paymentStatus === 'partial' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium">Actual Fee</span>
                  <span className="text-sm font-bold text-gray-800 font-mono">₹{totalFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium">Paid</span>
                  <span className="text-sm font-black text-green-600 font-mono">₹{amountPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-1">
                  <span className="text-xs text-red-500 font-bold">Due</span>
                  <span className="text-sm font-black text-red-500 font-mono">₹{(totalFee - amountPaid).toLocaleString('en-IN')}</span>
                </div>
              </>
            )}

            {paymentStatus === 'discounted' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium">Actual Fee</span>
                  <span className="text-sm font-bold text-gray-800 font-mono">₹{totalFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium">Discount</span>
                  <span className="text-sm font-black text-purple-600 font-mono">-₹{discountAmt.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-1">
                  <span className="text-xs text-green-600 font-bold">Paid</span>
                  <span className="text-sm font-black text-green-600 font-mono">₹{(totalFee - discountAmt).toLocaleString('en-IN')}</span>
                </div>
              </>
            )}

            {paymentStatus === 'pending' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Pending (No payment)</span>
                <span className="text-sm font-black text-red-500 font-mono">₹{totalFee.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          {/* Refund Section — only for non-pending */}
          {!isPending && (
            <div className="space-y-3">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Refund</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setWantRefund(true); setRefundAmount(actualPaid) }}
                  className={cn(
                    "flex-1 p-3 rounded-xl border-2 text-center transition-all text-xs font-bold",
                    wantRefund ? "border-green-500 bg-green-50 text-green-700" : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                  )}
                >
                  <IndianRupee className="w-4 h-4 mx-auto mb-1" />
                  Refund Dena Hai
                </button>
                <button
                  type="button"
                  onClick={() => { setWantRefund(false); setRefundAmount(0) }}
                  className={cn(
                    "flex-1 p-3 rounded-xl border-2 text-center transition-all text-xs font-bold",
                    !wantRefund ? "border-red-500 bg-red-50 text-red-700" : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                  )}
                >
                  <Ban className="w-4 h-4 mx-auto mb-1" />
                  No Refund
                </button>
              </div>

              {wantRefund && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Refund Amount</label>
                  <input
                    type="number"
                    value={refundAmount || ''}
                    onChange={e => setRefundAmount(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-green-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 font-mono font-bold"
                    placeholder="Enter refund amount"
                    min={0}
                    max={actualPaid}
                  />
                  <p className="text-[10px] text-gray-400 ml-1">Max refundable: ₹{actualPaid.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {wantRefund && refundAmount > 0
                    ? `Refund ₹${refundAmount.toLocaleString('en-IN')} & Remove`
                    : 'Remove Without Refund'}
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full bg-gray-50 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
