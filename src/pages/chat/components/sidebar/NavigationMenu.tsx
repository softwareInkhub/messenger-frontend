import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "common/components/icons";
import useCloseMenu from "../../hooks/useCloseMenu";
import { Container, Button, Options, Option } from "../option-menu/styles";
import { signOutUser } from "../../../../config/firebase";

type NavigationMenuProps = {
  iconClassName?: string;
  className?: string;
  iconId: string;
  ariaLabel?: string;
  position?: string;
  showPressed?: boolean;
};

interface MenuOption {
  label: string;
  action: () => void;
}

export default function NavigationMenu(props: NavigationMenuProps) {
  const [showOptions, setShowOptions] = useState(false);
  const ref = useCloseMenu(() => setShowOptions(false));
  const navigate = useNavigate();
  
  const {
    iconId,
    ariaLabel,
    className,
    iconClassName,
    position = "left",
    showPressed = true,
  } = props;

  const menuOptions: MenuOption[] = [
    {
      label: "New group",
      action: () => {
        console.log("New group clicked");
        setShowOptions(false);
      }
    },
    {
      label: "Create a room",
      action: () => {
        console.log("Create a room clicked");
        setShowOptions(false);
      }
    },
    {
      label: "Profile",
      action: () => {
        console.log("Profile clicked");
        setShowOptions(false);
      }
    },
    {
      label: "User List",
      action: () => {
        navigate("/users");
        setShowOptions(false);
      }
    },
    {
      label: "Archived",
      action: () => {
        console.log("Archived clicked");
        setShowOptions(false);
      }
    },
    {
      label: "Starred",
      action: () => {
        console.log("Starred clicked");
        setShowOptions(false);
      }
    },
    {
      label: "Settings",
      action: () => {
        console.log("Settings clicked");
        setShowOptions(false);
      }
    },
    {
      label: "Log out",
      action: async () => {
        try {
          console.log("Logging out user...");
          await signOutUser();
          console.log("User logged out successfully");
          navigate("/login");
        } catch (error) {
          console.error("Logout error:", error);
          // Still navigate to login even if there's an error
          navigate("/login");
        }
        setShowOptions(false);
      }
    },
  ];

  const getBtnClassName = (): string => {
    let _className = showOptions && showPressed ? "btn-pressed " : "";
    _className += className ?? "";

    return _className;
  };

  const getOptionsClassName = (): string => {
    let className = showOptions ? "active " : "";
    className += position === "right" ? "right" : "";

    return className;
  };

  const handleClick = () => {
    setShowOptions(!showOptions);
  };

  return (
    <Container ref={ref}>
      <Button aria-label={ariaLabel} className={getBtnClassName()} onClick={handleClick}>
        <Icon id={iconId} className={iconClassName} />
      </Button>
      <Options className={getOptionsClassName()}>
        {menuOptions.map((option) => (
          <Option key={option.label} onClick={option.action}>
            {option.label}
          </Option>
        ))}
      </Options>
    </Container>
  );
}
