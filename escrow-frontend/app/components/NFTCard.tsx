// components/NFTCard.tsx
import { Box, Image, Heading, Text } from '@chakra-ui/react';
import NFT from '../types/nft';

interface NFTCardProps {
  nft: NFT;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={4}>
      <Image src={nft.imageUrl} alt={nft.name} mb={4} />
      <Heading size="md" mb={2}>{nft.name}</Heading>
      <Text color="gray.600">{nft.description}</Text>
    </Box>
  );
};

export default NFTCard;
