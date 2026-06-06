import React from 'react'
import Image from 'next/image'
import { Star, CheckCircle, Verified, ShieldCheck, ThumbsUp, Activity, BadgeCheck, MessageCircle } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import type { Review, Media } from '@/payload-types'
import type { ProductReviewStats } from '@/services/reviews'

interface ProductReviewsProps {
  reviews: Review[]
  stats: ProductReviewStats
}

export function ProductReviews({ reviews, stats }: ProductReviewsProps) {
  // If there are no reviews, show a placeholder or nothing
  if (reviews.length === 0) {
    return (
      <div className="mt-16 pt-12 border-t border-luxury-gray/40">
        <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-widest text-white uppercase mb-6">
          Customer Reviews
        </h2>
        <p className="text-gray-400">No reviews yet for this product.</p>
      </div>
    )
  }

  // Format date relative (mocked simply for now, Payload createdAt is a string)
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  // Determine overall rating text
  let ratingText = 'Good'
  if (stats.averageRating >= 4.5) ratingText = 'Outstanding'
  else if (stats.averageRating >= 4.0) ratingText = 'Excellent'
  else if (stats.averageRating >= 3.0) ratingText = 'Average'

  return (
    <div className="mt-16 pt-12 border-t border-luxury-gray/40 text-gray-200">
      <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-widest text-white uppercase mb-8">
        Customer Reviews
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & CTA */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Overall Rating Box */}
          <div className="bg-[#0c0c0c] border border-luxury-gray/40 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-4xl font-bold text-white font-serif">
                  <Star className="w-8 h-8 fill-luxury-gold text-luxury-gold" />
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="text-sm font-semibold text-white mt-2 tracking-wide uppercase">{ratingText}</div>
                <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider text-center">Based on {stats.totalReviews.toLocaleString()} reviews</div>
              </div>
              
              {/* Distribution Bars */}
              <div className="flex-1 flex flex-col gap-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution]
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                      <span className="w-3 text-right">{star}</span>
                      <Star className="w-2.5 h-2.5 fill-gray-500 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 h-1.5 bg-luxury-gray/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-luxury-gold rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-6 text-right">{Math.round(percentage)}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Metrics/Badges Box */}
          <div className="bg-[#0c0c0c] border border-luxury-gray/40 rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-4 gap-2 text-center divide-x divide-luxury-gray/30">
              <div className="flex flex-col items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full bg-luxury-gold/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-luxury-gold" />
                </div>
                <span className="text-[10px] font-bold text-white tracking-wide">{stats.totalReviews.toLocaleString()}</span>
                <span className="text-[8px] text-gray-500 uppercase tracking-widest leading-tight">Verified<br/>Reviews</span>
              </div>
              <div className="flex flex-col items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Verified className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-[10px] font-bold text-white tracking-wide">18</span>
                <span className="text-[8px] text-gray-500 uppercase tracking-widest leading-tight">Verified<br/>Vendors</span>
              </div>
              <div className="flex flex-col items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-[10px] font-bold text-white tracking-wide">98%</span>
                <span className="text-[8px] text-gray-500 uppercase tracking-widest leading-tight">Recommend<br/>This</span>
              </div>
              <div className="flex flex-col items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-[10px] font-bold text-white tracking-wide">Active</span>
                <span className="text-[8px] text-gray-500 uppercase tracking-widest leading-tight">Product<br/>Status</span>
              </div>
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0c0c0c] border border-luxury-gold/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <h3 className="font-serif text-lg font-bold text-white mb-2 leading-tight">Want the Best Deal for this Product?</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Get personalized offers from 18+ verified vendors directly on WhatsApp.
            </p>
            <a 
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=I%20want%20the%20best%20deal`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(37,211,102,0.2)]"
            >
              Get Best Deals <MessageCircle className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* Right Column: Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-widest">Recent Reviews</span>
          </div>

          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {reviews.map((review) => (
              <div key={review.id} className="bg-[#0c0c0c] border border-luxury-gray/40 rounded-2xl p-5 sm:p-6 shadow-md transition-colors hover:border-luxury-gold/30">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-luxury-dark border border-luxury-gray flex items-center justify-center text-luxury-gold font-bold font-serif text-lg uppercase shadow-inner">
                      {review.reviewerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-sm">{review.reviewerName}</h4>
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{formatRelativeTime(review.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-luxury-gold/10 px-2 py-1 rounded text-luxury-gold border border-luxury-gold/20">
                    <span className="text-xs font-bold">{review.rating}</span>
                    <Star className="w-3 h-3 fill-luxury-gold" />
                  </div>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {review.comment}
                </p>

                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {review.images.map((imgObj, idx) => {
                      const media = imgObj.image as Media | null
                      if (!media) return null
                      return (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-luxury-gray bg-black flex-shrink-0 cursor-pointer hover:border-luxury-gold transition-colors">
                          <Image src={getImageUrl(media)} alt="Review image" fill className="object-cover" />
                        </div>
                      )
                    })}
                  </div>
                )}

                {review.verifiedPurchase && (
                  <div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                    <CheckCircle className="w-3 h-3" />
                    Verified Purchase
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="w-full mt-4 bg-transparent border border-luxury-gray text-white py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-luxury-gray/10 hover:border-luxury-gold transition-colors">
            View All {stats.totalReviews.toLocaleString()} Reviews
          </button>
        </div>

      </div>
    </div>
  )
}
