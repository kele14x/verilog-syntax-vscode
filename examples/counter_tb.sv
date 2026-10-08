`include "packet.svh"

interface counter_if(input logic clk);
  logic reset_n;
  logic [7:0] count;
  modport monitor(input clk, reset_n, count);
endinterface

module counter_tb;
  timeunit 1ns;
  timeprecision 1ps;

  logic clk = 0;
  counter_if bus(clk);
  packet item;
  string message = "a string with \"quotes\" and // text";

  counter dut(.clk(clk), .reset_n(bus.reset_n), .count(bus.count));
  always #5ns clk = ~clk;

  property increments;
    @(posedge clk) disable iff (!bus.reset_n)
      1'b1 |=> bus.count == $past(bus.count) + 8'd1;
  endproperty
  assert property (increments);

  initial begin
    bus.reset_n = 0;
    item = new();
    assert (item.randomize());
    #12ns bus.reset_n = 1;
    $display("%s", item.describe());
    repeat (5) @(posedge clk);
    $finish;
  end
endmodule
