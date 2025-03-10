import React, { useState } from "react";
import { Popup, Space, Button } from "antd-mobile";

export default function WwGoal() {
  const [visible1, setVisible1] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setVisible1(true);
        }}
      >
        底部弹出
      </Button>
      <Popup
        visible={visible1}
        onMaskClick={() => {
          setVisible1(false);
        }}
        onClose={() => {
          setVisible1(false);
        }}
        bodyStyle={{ height: "40vh" }}
      >
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim, officiis
        numquam ipsam magni quisquam ea excepturi qui, quidem beatae, illo
        veniam atque voluptas? Incidunt delectus provident itaque at. Dicta,
        labore.
      </Popup>
    </>
  );
}
