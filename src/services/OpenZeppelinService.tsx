/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios from 'axios';

export const OpenZeppelinService = () => {
  const mintTrophy = async (tokenId: string, winnerAccount: string) => {
    console.log(process.env.MINT_TROPHY_URL);

    const { data } = await axios.post(process.env.MINT_TROPHY_URL!, {
      darkRallyNftAddr: '0x7Eb878f9c5AEbe42a4728e2F82eAC6388A583241',
      winnerAccount,
      tokenId,
      amount: '1',
      secret: process.env.OPEN_ZEPPELIN_DEFENDER,
    });
    return data;
  };

  return {
    mintTrophy,
  };
};
