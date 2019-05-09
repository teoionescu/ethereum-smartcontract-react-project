pragma solidity >=0.4.21 <0.6.0;

contract Roulette {
  address payable public owner;
  string[37] public options = [
    string("0"), "32", "15", "19", "4", "21", "2", "25", "17", "34", "6", "27", "13", "36", "11", "30", "8", "23", "10", "5", "24", "16", "33", "1", "20", "14", "31", "9", "22", "18", "29", "7", "28", "12", "35", "3", "26"
  ];

  struct gamblerarray {
    address payable etherAddress;
    uint amount;
  }

  gamblerarray[] public gamblerlist;
  uint public Gamblers_Until_Jackpot = 0;
  uint public Total_Gamblers = 0;
  uint public FeeRate = 5;
  uint public Bankroll = 0;
  uint public Jackpot = 0;
  uint public Total_Deposits = 0;
  uint public Total_Payouts = 0;
  uint public MinDeposit = 100 finney;
  uint Fees=0;

  modifier onlyowner {
    if (msg.sender == owner) {
      _;
    }
  }

  constructor() public {
    owner = msg.sender;
  }

  function bytesToUInt(bytes memory _b) public returns (uint256){
    bytes memory b = bytes(_b);
    uint256 number;
    for (uint i = 0; i < b.length; i++){
      number = number + uint256(uint8(b[i]))*(2**(8*(b.length-(i+1))));
    }
    return number;
  }

  function random() public view returns(uint) {
      uint source = block.difficulty + block.timestamp + block.number + gasleft();
      bytes memory source_b = toBytes(source);
      return uint(keccak256(source_b));
  }

  function toBytes(uint256 x) public pure returns (bytes memory b) {
      b = new bytes(32);
      assembly { mstore(add(b, 32), x) }
  }

  function spin() public view returns(uint) {
    return random() % 37;
  }

  function enter() public payable {
    if (msg.value > 10 finney) {
      uint amount = msg.value;

      // add a new participant to the system and calculate total players
      uint list_length = gamblerlist.length;
      Total_Gamblers = list_length + 1;
      Gamblers_Until_Jackpot = 40 - (Total_Gamblers % 40);
      gamblerlist.length += 1;
      gamblerlist[list_length].etherAddress = msg.sender;
      gamblerlist[list_length].amount = amount;

      // set payout variables
      Total_Deposits += amount;       	  // update deposited amount
      Fees = amount * FeeRate / 100;      // 5% fee to the owner
      amount -= amount * FeeRate / 100;
      Bankroll += amount * 80 / 100;      // 80% to the balance
      amount -= amount * 80 / 100;
      Jackpot += amount;                	// remaining to the jackpot

      // payout fees to the owner
      if (Fees != 0) {
        uint minimal = 1990 finney;
        if(Fees < minimal)
        {
          owner.transfer(Fees);		        // send fee to owner
          Total_Payouts += Fees;          // update paid out amount
        } else {
        uint Times = Fees/minimal;
        for (uint i = 0; i < Times; i++)  // send the fees out in packets compatible to EthVentures dividend function
          if (Fees > 0) {
            owner.transfer(minimal);		  // send fee to owner
            Total_Payouts += Fees;        // update paid out amount
            Fees -= minimal;
          }
        }
      }

      if (msg.value >= MinDeposit) {
        // payout to participants
        if (list_length % 40 == 0 && Jackpot > 0) {
          gamblerlist[list_length].etherAddress.transfer(Jackpot);  // send pay out to participant
          Total_Payouts += Jackpot;               					        // update paid out amount
          Jackpot = 0;					                               			// jackpot update
        } else {
          // bytes32 myadd = bytes32(uint256(gamblerlist[list_length].etherAddress) << 96); list_length
          if (random() % 4 == 0 && Bankroll > 0) {
            // if the hashed length of your address is even
            gamblerlist[list_length].etherAddress.transfer(Bankroll);        // send pay out to participant
            Total_Payouts += Bankroll;               					               // update paid out amount
            Bankroll = 0;                      						                   // bankroll update
          }
        }
      }
    }
  }

  //******************************************** OWNER
  function setOwner(address payable new_owner) public onlyowner { // set new owner of the casino
    owner = new_owner;
  }
  function setMinDeposit(uint new_mindeposit) public onlyowner {  // set new minimum deposit rate
    MinDeposit = new_mindeposit;
  }
  function setFeeRate(uint new_feerate) public onlyowner {        // set new fee rate
    FeeRate = new_feerate;
  }
  // https://etherscan.io/address/0x78b058ccda93816487c655367dcb79664a216ad2#code
}
