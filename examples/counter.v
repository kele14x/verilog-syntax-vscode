`include "counter.vh"

module counter #(
  parameter WIDTH = `COUNTER_WIDTH
) (
  input wire clk,
  input wire reset_n,
  output reg [WIDTH-1:0] count
);
  // Reset the counter asynchronously.
  always @(posedge clk or negedge reset_n) begin
    if (!reset_n)
      count <= 8'h00;
    else
      count <= count + 1'b1;
  end

  /* The comment continues
     across multiple lines. */
  initial $display("counter ready // not a comment");
endmodule
