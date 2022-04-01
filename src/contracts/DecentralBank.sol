pragma solidity ^0.8.0;

import './RWD.sol';
import './Tether.sol';

contract DecentralBank {
    string public name = 'Decentral Bank';
    address public owner;
    RWD public rwd;
    Tether public tether;

    address[] public stakers;

    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(RWD _rwd, Tether _tether) public {
        rwd = _rwd;
        tether = _tether;
        owner = msg.sender;
    }

    function depositTokens(uint256 _amount) public {
        // require(tether.balanceOf[msg.sender] >= _amount);
        require(_amount > 0, 'amount cannot be 0');
        tether.transferFrom(msg.sender, address(this), _amount);
        // tether.transfer(address(this), _amount);

        stakingBalance[msg.sender] += _amount;

        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }

        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    function unstakeTokens() public {
        uint256 balance = stakingBalance[msg.sender];
        require(balance > 0, 'staking balance cannot be less then 0');

        // stakingBalance[msg.sender] -= balance;
        tether.transfer(msg.sender, balance);

        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }

    function issueTokens() public {
        require(msg.sender == owner, 'caller must be owner');
        for(uint i=0; i<stakers.length; i++){
            if(stakingBalance[stakers[i]] > 0){
                rwd.transfer(stakers[i], (stakingBalance[stakers[i]] / 9));
            }
        }
    }
}