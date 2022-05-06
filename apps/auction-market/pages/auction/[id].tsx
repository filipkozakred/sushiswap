import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { FC, useMemo } from 'react'
import { getBuiltGraphSDK } from '../../.graphclient'
import Layout from '../../components/Layout'
import { Auction } from 'features/context/Auction'
import { Bid } from 'features/context/Bid'
import { AuctionRepresentation, BidRepresentation } from 'features/context/representations'


interface Props {
  auctionRepresentation?: AuctionRepresentation
  bidRepresentations?: BidRepresentation[]
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  if (typeof query.id !== 'string') return { props: {} }
  const sdk = await getBuiltGraphSDK()
  const auctionRepresentation = (await sdk.Auction({ id: query.id })).auction as AuctionRepresentation
  const bidRepresentations = (await sdk.Bids({ auctionId: query.id })).auction?.bids as BidRepresentation[]
  return {
    props: {
      auctionRepresentation,
      bidRepresentations,
    },
  }
}

const ActionPage: FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ auctionRepresentation, bidRepresentations }) => {

  const auction = useMemo(() => auctionRepresentation ? new Auction({ auction: auctionRepresentation }) : undefined, [auctionRepresentation])
  const bids = useMemo(() => bidRepresentations?.map((bid) => new Bid({ bid })), [bidRepresentations])

  return (
    <Layout>
      <div>
        <h2>Auction</h2>
        {auction ? (
          <div key={auction.id}>
            {auction.status} {``}
            {auction.amount.toString()} {` SUSHI `}
            {auction.leadingBid.amount.toString()} {auction.token?.symbol}
            {auction.startDate.toLocaleDateString()} {``}
            {auction.endDate?.toLocaleDateString()} {``}
            
          </div>
        ) : (
          'No auction found'
        )}
      </div>
      <div>
        <h2>Bids</h2>
        {bids?.length ? (
          bids.map((bid) => (
            <div key={bid.id}>
              {`${bid.amount.toString()} ${bid.timestamp} ${bid.user?.id}`}
            </div>
          ))
        ) : (
          <div>
            <i>No bids found..</i>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ActionPage