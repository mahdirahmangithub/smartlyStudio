import { Navbar } from "@sds/components/Navbar";
import { NavBarContent } from "@sds/components/NavBarContent";
import { NavigationBrandItem } from "@sds/components/NavigationBrandItem";
import { Breadcrumb } from "@sds/components/Breadcrumb";
import { BreadcrumbItem } from "@sds/components/BreadcrumbItem";
import { Button } from "@sds/components/Button";
import { IconButton } from "@sds/components/IconButton";
import { SelectButton } from "@sds/components/SelectButton";
import { Icon } from "@sds/components/Icon";
import styles from "./ReportingTagIntelligenceTemplate.module.css";

export function ReportingTagIntelligenceTemplate() {
  return (
    <div className={styles.root}>
      <Navbar
        className={styles.navbar}
        logo={<NavigationBrandItem hideLogotype />}
        position="sticky"
      >
        <NavBarContent
          description={<span>Description</span>}
          actions={[
            {
              id: "more-actions",
              element: (
                <SelectButton size="md" emphasis="medium">
                  More actions
                </SelectButton>
              ),
              overflow: true,
              overflowLabel: "More actions",
              overflowIcon: "more_horiz",
            },
            {
              id: "share",
              element: (
                <SelectButton
                  size="md"
                  emphasis="medium"
                  leadingIcon={<Icon name="share" size={16} />}
                >
                  Share
                </SelectButton>
              ),
              overflow: true,
              overflowLabel: "Share",
              overflowIcon: "share",
            },
            {
              id: "download",
              element: (
                <IconButton
                  size="md"
                  variant="neutral"
                  emphasis="medium"
                  icon={<Icon name="download" size={16} />}
                  aria-label="Download"
                />
              ),
              overflow: true,
              overflowLabel: "Download",
              overflowIcon: "download",
            },
            {
              id: "save",
              element: (
                <Button size="md" variant="brand" emphasis="high">
                  Save
                </Button>
              ),
            },
          ]}
        >
          <Breadcrumb size="md">
            <BreadcrumbItem>Reporting</BreadcrumbItem>
            <BreadcrumbItem current>Tag Intelligence</BreadcrumbItem>
          </Breadcrumb>
        </NavBarContent>
      </Navbar>
      <div className={styles.body} />
    </div>
  );
}

ReportingTagIntelligenceTemplate.displayName = "ReportingTagIntelligenceTemplate";
