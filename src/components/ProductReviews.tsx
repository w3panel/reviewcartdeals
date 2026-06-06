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
      <div className="mt-16 pt-12 border-t border-border">
        <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-widest text-foreground uppercase mb-6">
          Customer Reviews
        </h2>
        <p className="text-muted-foreground">No reviews yet for this product.</p>
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
    <div className="mt-16 pt-12 border-t border-border text-foreground">
      <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-widest text-foreground uppercase mb-8">
        Customer Reviews
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & CTA */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Overall Rating Box */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-4xl font-bold text-foreground font-serif">
                  <Star className="w-8 h-8 fill-primary text-primary" />
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="text-sm font-semibold text-foreground mt-2 tracking-wide uppercase">{ratingText}</div>
                <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider text-center">Based on {stats.totalReviews.toLocaleString()} reviews</div>
              </div>
              
              {/* Distribution Bars */}
              <div className="flex-1 flex flex-col gap-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution]
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                      <span className="w-3 text-right">{star}</span>
                      <Star className="w-2.5 h-2.5 fill-muted-foreground text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
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
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-4 gap-2 text-center divide-x divide-border">
              <div className="flex flex-col items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-foreground tracking-wide">{stats.totalReviews.toLocaleString()}</span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest leading-tight">Verified<br/>Reviews</span>
              </div>
              <div className="flex flex-col items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Verified className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-foreground tracking-wide">18</span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest leading-tight">Verified<br/>Vendors</span>
              </div>
              <div className="flex flex-col items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ThumbsUp className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-foreground tracking-wide">98%</span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest leading-tight">Recommend<br/>This</span>
              </div>
              <div className="flex flex-col items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-foreground tracking-wide">Active</span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest leading-tight">Product<br/>Status</span>
              </div>
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-card border border-primary/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <h3 className="font-serif text-lg font-bold text-foreground mb-2 leading-tight">Want the Best Deal for this Product?</h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Get personalized offers from 18+ verified vendors directly on WhatsApp.
            </p>
            <a 
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=I%20want%20the%20best%20deal`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground py-3.5 rounded-xl border border-[#F5B82A] text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-primary/20"
            >
              Get Best Deals <MessageCircle className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* Right Column: Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-widest">Recent Reviews</span>
          </div>

          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {reviews.map((review) => (
              <div key={review.id} className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-md transition-colors hover:border-primary/30">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-primary font-bold font-serif text-lg uppercase shadow-inner">
                      {review.reviewerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-foreground text-sm">{review.reviewerName}</h4>
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{formatRelativeTime(review.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded text-primary border border-primary/20">
                    <span className="text-xs font-bold">{review.rating}</span>
                    <Star className="w-3 h-3 fill-primary" />
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {review.comment}
                </p>

                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {review.images.map((imgObj, idx) => {
                      const media = imgObj.image as Media | null
                      if (!media) return null
                      return (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0 cursor-pointer hover:border-primary transition-colors">
                          <Image src={getImageUrl(media)} alt="Review image" fill className="object-cover" />
                        </div>
                      )
                    })}
                  </div>
                )}

                {review.verifiedPurchase && (
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                    <CheckCircle className="w-3 h-3" />
                    Verified Purchase
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="w-full mt-4 bg-transparent border border-[#F5B82A] text-primary py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-colors">
            View All {stats.totalReviews.toLocaleString()} Reviews
          </button>
        </div>

      </div>
    </div>
  )
}
