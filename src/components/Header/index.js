import React from "react";
import styled from "styled-components";
import { ReactComponent as Logo } from "../../img/logo.svg";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 2rem;
  color: #ffffff;
  font-size: 0.875rem;
`;

const Header = () => {
  return (
    <Container>
      <a href="https://github.com/ngolapnguyen">
        <Logo width={32} height={32} />
      </a>
      <div>Navigate by Click & Drag</div>
    </Container>
  );
};

export default Header;
