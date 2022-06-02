import FarmTable from 'components/FarmTable'
import Layout from 'components/Layout'
import { RewardsAvailableModal } from 'components/RewardsAvailableModal'
import { getSubscribedIncentives, getUserFarms } from 'graph/graph-client'
import { Farm } from 'lib/Farm'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import { FC, useMemo } from 'react'
import useSWR, { SWRConfig } from 'swr'
import { useAccount, useConnect, useNetwork } from 'wagmi'

import type { KOVAN_STAKING_Farm as FarmDTO } from '../../../.graphclient'

const fetcher = (params: any) =>
  fetch(params)
    .then((res) => res.json())
    .catch((e) => console.log(JSON.stringify(e)))

interface Props {
  fallback?: Record<string, any>
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  if (typeof query.chainId !== 'string' || typeof query.address !== 'string') return { props: {} }

  return {
    props: {
      fallback: {
        [`/api/user/${query.address}/farms/${query.chainId}`]: await getUserFarms(query.chainId, query.address),
        [`/api/user/${query.address}/subscriptions/${query.chainId}`]: await getSubscribedIncentives(
          query.chainId,
          query.address
        ),
      },
    },
  }
}

const _FarmsPage: FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ fallback }) => {
  return (
    <SWRConfig value={{ fallback }}>
      <FarmsPage />
    </SWRConfig>
  )
}

export const FarmsPage: FC = () => {
  const router = useRouter()
  const chainId = Number(router.query.chainId as string)
  const { activeChain } = useNetwork()
  const { data: account } = useAccount()
  const connect = useConnect()

  const { data: subscriptions, isValidating: isValidatingSubscriptions } = useSWR<string[]>(
    `/onsen/api/user/${account?.address}/subscriptions/${chainId}`,
    fetcher
  )

  const { data: userFarms, isValidating: isValidatingFarms } = useSWR<FarmDTO[]>(
    `/onsen/api/user/${account?.address}/farms/${chainId}`,
    fetcher
  )

  const farms = useMemo(() => {
    if (isValidatingFarms || isValidatingSubscriptions) return []
    const now = new Date().getTime() / 1000
    const mappedFarms =
      userFarms
        ?.map(
          (farm) =>
            new Farm({
              token: farm.stakeToken,
              incentives: farm.incentives.filter((incentive) => incentive.endTime >= now),
            })
        )
        .filter((farm) => farm.incentives.length) ?? [] // TODO: move filtering logic to api? can't do at query level, no Or operator (need to filter out expired incentives)
    mappedFarms.forEach((farm) =>
      farm.incentives.forEach((incentive) => {
        if (subscriptions?.includes(incentive.id)) {
          incentive.isSubscribed = true
        }
      })
    )
    return mappedFarms
  }, [userFarms, subscriptions, isValidatingFarms, isValidatingSubscriptions])

  return (
    <Layout>
      <RewardsAvailableModal farms={farms} chainId={activeChain?.id} />
      <FarmTable
        farms={farms}
        chainId={activeChain?.id}
        showSubscribeAction={false}
        loading={isValidatingSubscriptions || isValidatingFarms}
        placeholder="No incoming incentives found"
      />
    </Layout>
  )
}

export default _FarmsPage