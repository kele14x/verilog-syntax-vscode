`ifndef PACKET_SVH
`define PACKET_SVH

class packet;
  rand bit [7:0] payload;
  constraint payload_range { payload inside {[8'h10:8'hEF]}; }

  function string describe();
    return $sformatf("payload=%h", payload);
  endfunction
endclass

`endif
