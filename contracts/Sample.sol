pragma solidity ^0.4.0;

contract Sample {

  mapping(uint256 => uint256) data;

  event set(uint256 key, uint256 value);

  function set(uint256 key, uint256 value) public {
    data[key] = value;
    emit set(key, value);
  }

  function get(uint256 key) view public returns (uint256 value) {
    value = data[key];
  }
}
